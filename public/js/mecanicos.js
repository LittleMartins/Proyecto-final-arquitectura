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

class MecanicoController {
    constructor() {
        this.mecanicosRef = collection(db, 'mecanicos');
        this.init();
    }

    init() {
        document.getElementById('mecanicoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarMecanico();
        });
        this.cargarMecanicos();
    }

    async registrarMecanico() {
        try {
            const mecanico = {
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                especialidad: document.getElementById('especialidad').value,
                disponibilidad: document.getElementById('disponibilidad').value,
                fechaRegistro: new Date().toISOString()
            };

            await addDoc(this.mecanicosRef, mecanico);
            alert('Mecánico registrado exitosamente');
            document.getElementById('mecanicoForm').reset();
            this.cargarMecanicos();
        } catch (error) {
            console.error('Error al registrar mecánico:', error);
            alert('Error al registrar mecánico');
        }
    }

    async cargarMecanicos() {
        try {
            const querySnapshot = await getDocs(this.mecanicosRef);
            const listaMecanicos = document.getElementById('listaMecanicos');
            listaMecanicos.innerHTML = '';

            querySnapshot.forEach((doc) => {
                const mecanico = doc.data();
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `
                    <div class="card-content">
                        <h3>${mecanico.nombre} ${mecanico.apellido}</h3>
                        <p>Especialidad: ${mecanico.especialidad}</p>
                        <p>Estado: <span class="status-badge status-${mecanico.disponibilidad}">${mecanico.disponibilidad}</span></p>
                        <div class="btn-group">
                            <button class="btn-primary" onclick="cambiarDisponibilidad('${doc.id}')">Cambiar Estado</button>
                            <button class="btn-danger" onclick="eliminarMecanico('${doc.id}')">Eliminar</button>
                        </div>
                    </div>
                `;
                listaMecanicos.appendChild(div);
            });
        } catch (error) {
            console.error('Error al cargar mecánicos:', error);
        }
    }

    async cambiarDisponibilidad(id) {
        try {
            const mecanicoRef = doc(this.mecanicosRef, id);
            const mecanicoDoc = await getDoc(mecanicoRef);
            const estadoActual = mecanicoDoc.data().disponibilidad;

            const estados = ['disponible', 'ocupado', 'ausente'];
            const indexActual = estados.indexOf(estadoActual);
            const nuevoEstado = estados[(indexActual + 1) % estados.length];

            await updateDoc(mecanicoRef, { disponibilidad: nuevoEstado });
            this.cargarMecanicos();
        } catch (error) {
            console.error('Error al cambiar disponibilidad:', error);
            alert('Error al cambiar disponibilidad');
        }
    }

    async eliminarMecanico(id) {
        if (confirm('¿Está seguro de eliminar este mecánico?')) {
            try {
                await deleteDoc(doc(this.mecanicosRef, id));
                alert('Mecánico eliminado exitosamente');
                this.cargarMecanicos();
            } catch (error) {
                console.error('Error al eliminar mecánico:', error);
                alert('Error al eliminar mecánico');
            }
        }
    }
}

// Inicializar el controlador
const mecanicoController = new MecanicoController();

// Exponer funciones para los botones
window.cambiarDisponibilidad = (id) => mecanicoController.cambiarDisponibilidad(id);
window.eliminarMecanico = (id) => mecanicoController.eliminarMecanico(id); 