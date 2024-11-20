import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    deleteDoc,
    query,
    where,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

class VehiculoController {
    constructor() {
        this.vehiculosRef = collection(db, 'vehiculos');
        this.clientesRef = collection(db, 'clientes');
        this.init();
    }

    async init() {
        await this.cargarClientes();
        this.setupEventListeners();
        await this.listarVehiculos();
    }

    async cargarClientes() {
        try {
            const querySnapshot = await getDocs(this.clientesRef);
            const clienteSelect = document.getElementById('clienteSelect');
            clienteSelect.innerHTML = '<option value="">Seleccione un cliente</option>';
            
            querySnapshot.forEach(doc => {
                const cliente = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = `${cliente.nombre} ${cliente.apellido}`;
                clienteSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar clientes:", error);
        }
    }

    setupEventListeners() {
        const form = document.getElementById('vehiculoForm');
        form.addEventListener('submit', (e) => this.registrarVehiculo(e));
    }

    async registrarVehiculo(e) {
        e.preventDefault();
        
        const clienteId = document.getElementById('clienteSelect').value;
        const marca = document.getElementById('marca').value;
        const matricula = document.getElementById('matricula').value;
        const año = document.getElementById('año').value;

        try {
            // Obtener los datos del cliente usando la sintaxis moderna
            const clienteDocRef = doc(db, 'clientes', clienteId);
            const clienteSnap = await getDoc(clienteDocRef);
            const clienteData = clienteSnap.data();
            
            await addDoc(this.vehiculosRef, {
                clienteId,
                clienteNombre: `${clienteData.nombre} ${clienteData.apellido}`,
                marca,
                matricula,
                año: parseInt(año)
            });

            e.target.reset();
            await this.listarVehiculos();
        } catch (error) {
            console.error("Error al registrar vehículo:", error);
        }
    }

    async listarVehiculos() {
        try {
            const querySnapshot = await getDocs(this.vehiculosRef);
            const listaVehiculos = document.getElementById('listaVehiculos');
            listaVehiculos.innerHTML = '';

            querySnapshot.forEach(doc => {
                const vehiculo = doc.data();
                const card = this.crearTarjetaVehiculo(doc.id, vehiculo);
                listaVehiculos.innerHTML += card;
            });
        } catch (error) {
            console.error("Error al listar vehículos:", error);
        }
    }

    crearTarjetaVehiculo(id, vehiculo) {
        return `
            <div class="card">
                <h3><i class="fas fa-car"></i> ${vehiculo.marca}</h3>
                <div class="card-content">
                    <p><i class="fas fa-user"></i> Cliente: ${vehiculo.clienteNombre}</p>
                    <p><i class="fas fa-hashtag"></i> Matrícula: ${vehiculo.matricula}</p>
                    <p><i class="fas fa-calendar"></i> Año: ${vehiculo.año}</p>
                </div>
                <div class="card-actions">
                    <button class="btn-action btn-edit" onclick="editarVehiculo('${id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-action btn-delete" onclick="eliminarVehiculo('${id}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
    }

    async eliminarVehiculo(id) {
        try {
            await deleteDoc(doc(this.vehiculosRef, id));
            await this.listarVehiculos();
        } catch (error) {
            console.error("Error al eliminar vehículo:", error);
        }
    }
}

// Inicializar el controlador
const vehiculoController = new VehiculoController();

// Exponer funciones para los botones
window.eliminarVehiculo = (id) => vehiculoController.eliminarVehiculo(id);
window.editarVehiculo = (id) => vehiculoController.editarVehiculo(id); 