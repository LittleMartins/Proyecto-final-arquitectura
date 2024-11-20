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

class ServicioController {
    constructor() {
        this.serviciosRef = collection(db, 'servicios');
        this.repuestosRef = collection(db, 'repuestos');
        this.init();
    }

    init() {
        this.cargarRepuestos();
        document.getElementById('servicioForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarServicio();
        });
        this.cargarServicios();
    }

    async cargarRepuestos() {
        try {
            const querySnapshot = await getDocs(this.repuestosRef);
            const repuestosSelect = document.getElementById('repuestosSelect');
            repuestosSelect.innerHTML = '<option value="">Seleccione los repuestos necesarios</option>';

            querySnapshot.forEach((doc) => {
                const repuesto = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = `${repuesto.descripcion} (Stock: ${repuesto.stock})`;
                repuestosSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar repuestos:', error);
        }
    }

    async registrarServicio() {
        try {
            const servicio = {
                descripcion: document.getElementById('descripcion').value,
                valorServicio: parseFloat(document.getElementById('valorServicio').value),
                repuestos: Array.from(document.getElementById('repuestosSelect').selectedOptions).map(option => option.value),
                fechaCreacion: new Date().toISOString()
            };

            await addDoc(this.serviciosRef, servicio);
            alert('Servicio registrado exitosamente');
            document.getElementById('servicioForm').reset();
            this.cargarServicios();
        } catch (error) {
            console.error('Error al registrar servicio:', error);
            alert('Error al registrar servicio');
        }
    }

    async cargarServicios() {
        try {
            const querySnapshot = await getDocs(this.serviciosRef);
            const listaServicios = document.getElementById('listaServicios');
            listaServicios.innerHTML = '';

            for (const servicioDoc of querySnapshot.docs) {
                const servicio = servicioDoc.data();
                const div = document.createElement('div');
                div.className = 'card';

                let repuestosHTML = '';
                let costoRepuestos = 0;
                for (const repuestoId of servicio.repuestos) {
                    const repuestoDoc = await getDoc(doc(this.repuestosRef, repuestoId));
                    if (repuestoDoc.exists()) {
                        const repuesto = repuestoDoc.data();
                        repuestosHTML += `<li>${repuesto.descripcion}</li>`;
                    }
                }

                div.innerHTML = `
                    <div class="card-content">
                        <h3>${servicio.descripcion}</h3>
                        <p>Valor del servicio: $${servicio.valorServicio}</p>
                        <div class="repuestos-lista">
                            <h4>Repuestos necesarios:</h4>
                            <ul>${repuestosHTML || '<li>Ninguno</li>'}</ul>
                        </div>
                        <button class="btn-danger" onclick="eliminarServicio('${servicioDoc.id}')">Eliminar</button>
                    </div>
                `;
                listaServicios.appendChild(div);
            }
        } catch (error) {
            console.error('Error al cargar servicios:', error);
        }
    }

    async eliminarServicio(id) {
        if (confirm('¿Está seguro de eliminar este servicio?')) {
            try {
                await deleteDoc(doc(this.serviciosRef, id));
                alert('Servicio eliminado exitosamente');
                this.cargarServicios();
            } catch (error) {
                console.error('Error al eliminar servicio:', error);
                alert('Error al eliminar servicio');
            }
        }
    }
}

// Inicializar el controlador
const servicioController = new ServicioController();

// Exponer funciones para los botones
window.eliminarServicio = (id) => servicioController.eliminarServicio(id); 