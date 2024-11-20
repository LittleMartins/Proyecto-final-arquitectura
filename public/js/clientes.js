import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    deleteDoc 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

class ClienteController {
    constructor() {
        console.log('ClienteController inicializado');
        this.clientesRef = collection(db, 'clientes');
        this.init();
    }

    init() {
        console.log('Inicializando eventos');
        document.getElementById('clienteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarCliente();
        });
        this.cargarClientes();
    }

    async registrarCliente() {
        try {
            console.log('Intentando registrar cliente');
            const cliente = {
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                direccion: document.getElementById('direccion').value,
                fechaRegistro: new Date().toISOString()
            };

            console.log('Datos del cliente:', cliente);
            const docRef = await addDoc(this.clientesRef, cliente);
            console.log('Cliente registrado con ID:', docRef.id);
            
            alert('Cliente registrado exitosamente');
            document.getElementById('clienteForm').reset();
            this.cargarClientes();
        } catch (error) {
            console.error('Error al registrar cliente:', error);
            alert('Error al registrar cliente: ' + error.message);
        }
    }

    async cargarClientes() {
        try {
            console.log('Cargando clientes');
            const querySnapshot = await getDocs(this.clientesRef);
            const listaClientes = document.getElementById('listaClientes');
            listaClientes.innerHTML = '';

            querySnapshot.forEach((doc) => {
                const cliente = doc.data();
                console.log('Cliente encontrado:', cliente);
                
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `
                    <div class="card-content">
                        <h3>${cliente.nombre} ${cliente.apellido}</h3>
                        <p>Dirección: ${cliente.direccion}</p>
                        <p>Fecha de registro: ${new Date(cliente.fechaRegistro).toLocaleDateString()}</p>
                        <button class="btn-danger" onclick="eliminarCliente('${doc.id}')">Eliminar</button>
                    </div>
                `;
                listaClientes.appendChild(div);
            });
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            alert('Error al cargar clientes: ' + error.message);
        }
    }

    async eliminarCliente(id) {
        if (confirm('¿Está seguro de eliminar este cliente?')) {
            try {
                console.log('Eliminando cliente:', id);
                await deleteDoc(doc(this.clientesRef, id));
                alert('Cliente eliminado exitosamente');
                this.cargarClientes();
            } catch (error) {
                console.error('Error al eliminar cliente:', error);
                alert('Error al eliminar cliente: ' + error.message);
            }
        }
    }
}

// Inicializar el controlador
const clienteController = new ClienteController();

// Exponer funciones para los botones
window.eliminarCliente = (id) => clienteController.eliminarCliente(id);
