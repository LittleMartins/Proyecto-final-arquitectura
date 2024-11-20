import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    deleteDoc, 
    updateDoc,
    getDoc,
    query,
    where 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

class CitaController {
    constructor() {
        this.citasRef = collection(db, 'citas');
        this.clientesRef = collection(db, 'clientes');
        this.vehiculosRef = collection(db, 'vehiculos');
        this.mecanicosRef = collection(db, 'mecanicos');
        this.serviciosRef = collection(db, 'servicios');
        this.init();
    }

    // Primero definimos los métodos auxiliares
    getEstadoClase(estado) {
        const clases = {
            'pendiente': 'estado-pendiente',
            'en_proceso': 'estado-proceso',
            'completada': 'estado-completada',
            'cancelada': 'estado-cancelada'
        };
        return clases[estado] || 'estado-pendiente';
    }

    formatearEstado(estado) {
        const estados = {
            'pendiente': 'Pendiente',
            'en_proceso': 'En Proceso',
            'completada': 'Completada',
            'cancelada': 'Cancelada'
        };
        return estados[estado] || 'Pendiente';
    }

    init() {
        this.cargarClientes();
        this.cargarMecanicos();
        this.cargarServicios();
        
        document.getElementById('clienteSelect').addEventListener('change', () => {
            this.cargarVehiculosCliente();
        });

        document.getElementById('citaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.agendarCita();
        });

        this.cargarCitas();
    }

    async cargarClientes() {
        try {
            const querySnapshot = await getDocs(this.clientesRef);
            const select = document.getElementById('clienteSelect');
            select.innerHTML = '<option value="">Seleccione un cliente</option>';
            
            querySnapshot.forEach((doc) => {
                const cliente = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = `${cliente.nombre} ${cliente.apellido}`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        }
    }

    async cargarVehiculosCliente() {
        try {
            const clienteId = document.getElementById('clienteSelect').value;
            const select = document.getElementById('vehiculoSelect');
            select.innerHTML = '<option value="">Seleccione un vehículo</option>';

            if (!clienteId) return;

            const q = query(this.vehiculosRef, where("clienteId", "==", clienteId));
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach((doc) => {
                const vehiculo = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = `${vehiculo.marca} - ${vehiculo.matricula}`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar vehículos:', error);
        }
    }

    async cargarMecanicos() {
        try {
            const querySnapshot = await getDocs(this.mecanicosRef);
            const select = document.getElementById('mecanicoSelect');
            select.innerHTML = '<option value="">Seleccione un mecánico</option>';

            querySnapshot.forEach((doc) => {
                const mecanico = doc.data();
                if (mecanico.disponibilidad === 'disponible') {
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = `${mecanico.nombre} ${mecanico.apellido} - ${mecanico.especialidad}`;
                    select.appendChild(option);
                }
            });
        } catch (error) {
            console.error('Error al cargar mecánicos:', error);
        }
    }

    async cargarServicios() {
        try {
            const querySnapshot = await getDocs(this.serviciosRef);
            const select = document.getElementById('servicioSelect');
            select.innerHTML = '<option value="">Seleccione los servicios</option>';

            querySnapshot.forEach((doc) => {
                const servicio = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = `${servicio.descripcion} - $${servicio.valorServicio}`;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar servicios:', error);
        }
    }

    async agendarCita() {
        try {
            const fecha = document.getElementById('fecha').value;
            const fechaSeleccionada = new Date(fecha);
            const ahora = new Date();

            if (fechaSeleccionada < ahora) {
                alert('No se pueden agendar citas en fechas pasadas');
                return;
            }

            const cita = {
                clienteId: document.getElementById('clienteSelect').value,
                vehiculoId: document.getElementById('vehiculoSelect').value,
                mecanicoId: document.getElementById('mecanicoSelect').value,
                serviciosIds: Array.from(document.getElementById('servicioSelect').selectedOptions).map(option => option.value),
                fecha: fecha,
                estado: 'pendiente',
                fechaCreacion: new Date().toISOString()
            };

            // Validar disponibilidad del mecánico
            const mecanicoRef = doc(this.mecanicosRef, cita.mecanicoId);
            await updateDoc(mecanicoRef, { disponibilidad: 'ocupado' });

            await addDoc(this.citasRef, cita);
            alert('Cita agendada exitosamente');
            document.getElementById('citaForm').reset();
            await this.cargarCitas();
        } catch (error) {
            console.error('Error al agendar cita:', error);
            alert('Error al agendar cita');
        }
    }

    async cargarCitas() {
        try {
            const listaCitas = document.getElementById('listaCitas');
            listaCitas.innerHTML = '<div class="loading">Cargando citas...</div>';

            const querySnapshot = await getDocs(this.citasRef);
            listaCitas.innerHTML = '';

            if (querySnapshot.empty) {
                listaCitas.innerHTML = '<div class="no-data">No hay citas programadas</div>';
                return;
            }

            // Ordenar citas por fecha
            const citas = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

            for (const cita of citas) {
                await this.renderizarCita(cita, listaCitas);
            }
        } catch (error) {
            console.error('Error al cargar citas:', error);
            listaCitas.innerHTML = '<div class="error">Error al cargar las citas</div>';
        }
    }

    async renderizarCita(cita, listaCitas) {
        try {
            const [clienteDoc, vehiculoDoc, mecanicoDoc] = await Promise.all([
                getDoc(doc(this.clientesRef, cita.clienteId)),
                getDoc(doc(this.vehiculosRef, cita.vehiculoId)),
                getDoc(doc(this.mecanicosRef, cita.mecanicoId))
            ]);

            const cliente = clienteDoc.data() || { nombre: 'No disponible', apellido: '' };
            const vehiculo = vehiculoDoc.data() || { marca: 'No disponible', matricula: '' };
            const mecanico = mecanicoDoc.data() || { nombre: 'No disponible', apellido: '' };

            const serviciosPromises = cita.serviciosIds.map(servicioId => 
                getDoc(doc(this.serviciosRef, servicioId))
            );
            const serviciosDocs = await Promise.all(serviciosPromises);
            
            let serviciosHTML = '';
            let valorTotal = 0;

            serviciosDocs.forEach(servicioDoc => {
                if (servicioDoc.exists()) {
                    const servicio = servicioDoc.data();
                    serviciosHTML += `
                        <li class="servicio-item">
                            <span class="servicio-nombre">${servicio.descripcion}</span>
                            <span class="servicio-precio">$${servicio.valorServicio}</span>
                        </li>`;
                    valorTotal += Number(servicio.valorServicio);
                }
            });

            const fechaCita = new Date(cita.fecha);
            const estadoClase = this.getEstadoClase(cita.estado);

            const citaCard = document.createElement('div');
            citaCard.className = 'cita-card';
            citaCard.innerHTML = `
                <div class="cita-header">
                    <div class="cita-fecha">
                        <i class="fas fa-calendar"></i>
                        ${fechaCita.toLocaleDateString('es-ES', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                    <span class="estado-badge ${estadoClase}">${this.formatearEstado(cita.estado)}</span>
                </div>
                <div class="cita-content">
                    <div class="cita-info">
                        <p><i class="fas fa-user"></i> <strong>Cliente:</strong> ${cliente.nombre} ${cliente.apellido}</p>
                        <p><i class="fas fa-car"></i> <strong>Vehículo:</strong> ${vehiculo.marca} - ${vehiculo.matricula}</p>
                        <p><i class="fas fa-wrench"></i> <strong>Mecánico:</strong> ${mecanico.nombre} ${mecanico.apellido}</p>
                    </div>
                    <div class="servicios-section">
                        <h4><i class="fas fa-tools"></i> Servicios:</h4>
                        <ul class="servicios-lista">
                            ${serviciosHTML}
                        </ul>
                        <div class="valor-total">
                            <strong>Total:</strong> $${valorTotal}
                        </div>
                    </div>
                    <div class="cita-actions">
                        <button class="btn btn-primary" onclick="cambiarEstadoCita('${cita.id}')">
                            <i class="fas fa-sync-alt"></i> Cambiar Estado
                        </button>
                        <button class="btn btn-danger" onclick="cancelarCita('${cita.id}')">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </div>
            `;

            listaCitas.appendChild(citaCard);
        } catch (error) {
            console.error('Error al renderizar cita:', error);
        }
    }

    async cambiarEstadoCita(citaId) {
        try {
            const citaRef = doc(this.citasRef, citaId);
            const citaDoc = await getDoc(citaRef);
            const estadoActual = citaDoc.data().estado;

            const estados = ['pendiente', 'en_proceso', 'completada'];
            const indexActual = estados.indexOf(estadoActual);
            const nuevoEstado = estados[(indexActual + 1) % estados.length];

            await updateDoc(citaRef, { estado: nuevoEstado });
            this.cargarCitas();
        } catch (error) {
            console.error('Error al cambiar estado de la cita:', error);
            alert('Error al cambiar estado de la cita');
        }
    }

    async cancelarCita(citaId) {
        if (confirm('¿Está seguro de cancelar esta cita?')) {
            try {
                const citaRef = doc(this.citasRef, citaId);
                const citaDoc = await getDoc(citaRef);
                const cita = citaDoc.data();

                // Liberar al mecánico
                const mecanicoRef = doc(this.mecanicosRef, cita.mecanicoId);
                await updateDoc(mecanicoRef, { disponibilidad: 'disponible' });

                await deleteDoc(citaRef);
                alert('Cita cancelada exitosamente');
                this.cargarCitas();
            } catch (error) {
                console.error('Error al cancelar cita:', error);
                alert('Error al cancelar cita');
            }
        }
    }
}

// Inicializar el controlador
const citaController = new CitaController();

// Exponer funciones para los botones
window.cambiarEstadoCita = (id) => citaController.cambiarEstadoCita(id);
window.cancelarCita = (id) => citaController.cancelarCita(id); 