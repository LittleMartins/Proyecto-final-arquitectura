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

class RepuestoController {
    constructor() {
        this.repuestosRef = collection(db, 'repuestos');
        this.init();
    }

    init() {
        document.getElementById('repuestoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarRepuesto();
        });
        this.cargarRepuestos();
    }

    async registrarRepuesto() {
        try {
            const repuesto = {
                descripcion: document.getElementById('descripcion').value,
                proveedor: document.getElementById('proveedor').value,
                stock: parseInt(document.getElementById('stock').value),
                fechaRegistro: new Date().toISOString()
            };

            await addDoc(this.repuestosRef, repuesto);
            alert('Repuesto registrado exitosamente');
            document.getElementById('repuestoForm').reset();
            this.cargarRepuestos();
        } catch (error) {
            console.error('Error al registrar repuesto:', error);
            alert('Error al registrar repuesto');
        }
    }

    async cargarRepuestos() {
        try {
            const querySnapshot = await getDocs(this.repuestosRef);
            const listaRepuestos = document.getElementById('listaRepuestos');
            listaRepuestos.innerHTML = '';

            querySnapshot.forEach((doc) => {
                const repuesto = doc.data();
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `
                    <div class="card-content">
                        <h3>${repuesto.descripcion}</h3>
                        <p>Proveedor: ${repuesto.proveedor}</p>
                        <p>Stock actual: ${repuesto.stock}</p>
                        <div class="stock-control">
                            <input type="number" id="cantidad-${doc.id}" min="1" value="1">
                            <button class="btn-primary" onclick="ajustarStock('${doc.id}', true)">Agregar Stock</button>
                            <button class="btn-danger" onclick="ajustarStock('${doc.id}', false)">Reducir Stock</button>
                        </div>
                        <button class="btn-danger" onclick="eliminarRepuesto('${doc.id}')">Eliminar</button>
                    </div>
                `;
                listaRepuestos.appendChild(div);
            });
        } catch (error) {
            console.error('Error al cargar repuestos:', error);
        }
    }

    async ajustarStock(repuestoId, aumentar) {
        try {
            const cantidad = parseInt(document.getElementById(`cantidad-${repuestoId}`).value);
            const repuestoRef = doc(this.repuestosRef, repuestoId);
            const repuestoDoc = await getDoc(repuestoRef);
            const stockActual = repuestoDoc.data().stock;

            let nuevoStock = aumentar ? stockActual + cantidad : stockActual - cantidad;
            
            if (nuevoStock < 0) {
                alert('No hay suficiente stock disponible');
                return;
            }

            await updateDoc(repuestoRef, { stock: nuevoStock });
            this.cargarRepuestos();
        } catch (error) {
            console.error('Error al ajustar stock:', error);
            alert('Error al ajustar stock');
        }
    }

    async eliminarRepuesto(id) {
        if (confirm('¿Está seguro de eliminar este repuesto?')) {
            try {
                await deleteDoc(doc(this.repuestosRef, id));
                alert('Repuesto eliminado exitosamente');
                this.cargarRepuestos();
            } catch (error) {
                console.error('Error al eliminar repuesto:', error);
                alert('Error al eliminar repuesto');
            }
        }
    }
}

// Inicializar el controlador
const repuestoController = new RepuestoController();

// Exponer funciones para los botones
window.ajustarStock = (id, aumentar) => repuestoController.ajustarStock(id, aumentar);
window.eliminarRepuesto = (id) => repuestoController.eliminarRepuesto(id); 