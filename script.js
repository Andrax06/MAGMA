// Datos de las habitaciones (40 en total, con descripciones y 9 imágenes placeholder por ahora)
const habitaciones = [
    // Primer piso (7 habitaciones)
    { id: 101, piso: 1, nombre: "Habitación 101", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/101/300/200", disponible: true, descripcion: "Habitación luminosa cerca de la entrada principal.", imagenes: Array(5).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 102, piso: 1, nombre: "Habitación 102", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/102/300/200", disponible: true, descripcion: "Espaciosa con vista al patio.", imagenes: Array(5).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 103, piso: 1, nombre: "Habitación 103", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/103/300/200", disponible: true, descripcion: "Ideal para una persona, cerca del baño.", imagenes: Array(5).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 104, piso: 1, nombre: "Habitación 104", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/104/300/200", disponible: true, descripcion: "Tranquila y bien ventilada.", imagenes: Array(5).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 105, piso: 1, nombre: "Habitación 105", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/105/300/200", disponible: true, descripcion: "Con espacio para escritorio.", imagenes: Array(5).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 106, piso: 1, nombre: "Habitación 106", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/106/300/200", disponible: true, descripcion: "Cerca de la cocina compartida.", imagenes: Array(5).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 107, piso: 1, nombre: "Habitación 107", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/107/300/200", disponible: true, descripcion: "Amplia y con buena luz natural.", imagenes: Array(5).fill("https://via.placeholder.com/300x200?text=Img") },

    // Segundo piso (9 habitaciones)
    { id: 201, piso: 2, nombre: "Habitación 201", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/201/300/200", disponible: true, descripcion: "Vista a la calle principal.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 202, piso: 2, nombre: "Habitación 202", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/202/300/200", disponible: true, descripcion: "Con balcón pequeño.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 203, piso: 2, nombre: "Habitación 203", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/203/300/200", disponible: true, descripcion: "Silenciosa, ideal para estudiar.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 204, piso: 2, nombre: "Habitación 204", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/204/300/200", disponible: true, descripcion: "Cerca del ascensor.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 205, piso: 2, nombre: "Habitación 205", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/205/300/200", disponible: true, descripcion: "Con closet amplio.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 206, piso: 2, nombre: "Habitación 206", precio: "400.000 COP/mes", imagen: "./Img/206/1.jpg", disponible: true, descripcion: "Cerca de la escalera.", imagenes: ["./Img/206/1.jpg", "./Img/206/2.jpg", "./Img/206/3.jpg", "./Img/206/4.jpg", "./Img/206/5.jpg"] },
    { id: 207, piso: 2, nombre: "Habitación 207", precio: "400.000 COP/mes", imagen: "./Img/207/1.jpg", disponible: true, descripcion: "Cerca de la escalera.", imagenes: ["./Img/207/1.jpg", "./Img/207/2.jpg", "./Img/207/3.jpg", "./Img/207/4.jpg"] },
    { id: 208, piso: 2, nombre: "Habitación 208", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/208/300/200", disponible: true, descripcion: "Con buena iluminación.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 209, piso: 2, nombre: "Habitación 209", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/209/300/200", disponible: true, descripcion: "Espaciosa y cómoda.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },

    // Tercer piso (8 habitaciones)
    { id: 301, piso: 3, nombre: "Habitación 301", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/301/300/200", disponible: true, descripcion: "Vista panorámica.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 302, piso: 3, nombre: "Habitación 302", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/302/300/200", disponible: true, descripcion: "Con espacio para estudio.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 303, piso: 3, nombre: "Habitación 303", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/303/300/200", disponible: true, descripcion: "Tranquila y acogedora.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 304, piso: 3, nombre: "Habitación 304", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/304/300/200", disponible: true, descripcion: "Cerca del baño compartido.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 305, piso: 3, nombre: "Habitación 305", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/305/300/200", disponible: true, descripcion: "Con buena ventilación.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 306, piso: 3, nombre: "Habitación 306", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/306/300/200", disponible: true, descripcion: "Ideal para estudiantes.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 307, piso: 3, nombre: "Habitación 307", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/307/300/200", disponible: true, descripcion: "Con vista al patio.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 308, piso: 3, nombre: "Habitación 308", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/308/300/200", disponible: true, descripcion: "Espaciosa y luminosa.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },

    // Cuarto piso (8 habitaciones)
    { id: 401, piso: 4, nombre: "Habitación 401", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/401/300/200", disponible: true, descripcion: "Con vista a la ciudad.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 402, piso: 4, nombre: "Habitación 402", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/402/300/200", disponible: true, descripcion: "Cerca del ascensor.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 403, piso: 4, nombre: "Habitación 403", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/403/300/200", disponible: true, descripcion: "Silenciosa y cómoda.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 404, piso: 4, nombre: "Habitación 404", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/404/300/200", disponible: true, descripcion: "Con balcón pequeño.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 405, piso: 4, nombre: "Habitación 405", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/405/300/200", disponible: true, descripcion: "Ideal para trabajar.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 406, piso: 4, nombre: "Habitación 406", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/406/300/200", disponible: true, descripcion: "Con buena luz.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 407, piso: 4, nombre: "Habitación 407", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/407/300/200", disponible: true, descripcion: "Cerca de la escalera.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 408, piso: 4, nombre: "Habitación 408", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/408/300/200", disponible: true, descripcion: "Espaciosa y tranquila.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },

    // Quinto piso (8 habitaciones)
    { id: 501, piso: 5, nombre: "Habitación 501", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/501/300/200", disponible: true, descripcion: "Vista panorámica superior.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 502, piso: 5, nombre: "Habitación 502", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/502/300/200", disponible: true, descripcion: "Con closet grande.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 503, piso: 5, nombre: "Habitación 503", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/503/300/200", disponible: true, descripcion: "Ideal para estudiantes.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 504, piso: 5, nombre: "Habitación 504", precio: "400.000 COP/mes", imagen: "./Img/504/1.jpg", disponible: true, descripcion: "Cerca de la escalera.", imagenes: ["./Img/504/1.jpg", "./Img/504/2.jpg", "./Img/504/3.jpg", "./Img/504/4.jpg", "./Img/504/5.jpg"] },
    { id: 505, piso: 5, nombre: "Habitación 505", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/505/300/200", disponible: true, descripcion: "Cerca del baño.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 506, piso: 5, nombre: "Habitación 506", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/506/300/200", disponible: true, descripcion: "Tranquila y luminosa.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 507, piso: 5, nombre: "Habitación 507", precio: "400.000 COP/mes", imagen: "https://picsum.photos/seed/507/300/200", disponible: true, descripcion: "Con vista al parque.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 508, piso: 5, nombre: "Habitación 508", precio: "400.000 COP/mes", imagen: "./Img/508/1.jpg", disponible: true, descripcion: "Cerca de la escalera.", imagenes: ["./Img/508/1.jpg", "./Img/508/2.jpg", "./Img/508/3.jpg", "./Img/508/4.jpg", "./Img/508/5.jpg"] },
];

// Se expone globalmente para que app.js (panel del inquilino) pueda mostrar
// el nombre/precio de la habitación asignada sin duplicar estos datos.
window.habitaciones = habitaciones;

// Llamado desde app.js con la lista de IDs ya asignados a un inquilino (colección
// pública "ocupacion" en Firestore, sin datos personales). Oculta esas habitaciones
// del catálogo público y vuelve a pintar.
window.actualizarDisponibilidad = function (idsOcupados) {
    habitaciones.forEach(h => {
        h.disponible = !idsOcupados.includes(h.id);
    });
    mostrarHabitaciones();
};

// Función para mostrar habitaciones disponibles, agrupadas por piso en una grilla
function mostrarHabitaciones() {
    const contenedor = document.getElementById("contenedor-habitaciones");
    contenedor.innerHTML = "";

    for (let piso = 1; piso <= 5; piso++) {
        const habitacionesPiso = habitaciones.filter(h => h.piso === piso && h.disponible);
        if (habitacionesPiso.length > 0) {
            const pisoDiv = document.createElement("div");
            pisoDiv.className = "piso-grupo";
            pisoDiv.innerHTML = `<h3 class="piso-titulo"><span class="piso-eyebrow">Piso ${piso}</span></h3>`;

            const grilla = document.createElement("div");
            grilla.className = "fila-habitaciones";

            habitacionesPiso.forEach(habitacion => {
                const div = document.createElement("div");
                div.className = "habitacion";
                div.innerHTML = `
                    <img src="${habitacion.imagen}" alt="${habitacion.nombre}">
                    <h3>${habitacion.nombre}</h3>
                    <p>Precio: <strong>${habitacion.precio}</strong></p>
                `;
                div.addEventListener("click", () => mostrarDetalles(habitacion));
                grilla.appendChild(div);
            });

            pisoDiv.appendChild(grilla);
            contenedor.appendChild(pisoDiv);
        }
    }

    if (habitaciones.every(h => !h.disponible)) {
        contenedor.innerHTML = "<p style='text-align:center'>No hay habitaciones disponibles en este momento.</p>";
    }
}

// Función para mostrar detalles en el modal (solo información, sin pagos aquí)
function mostrarDetalles(habitacion) {
    const modal = document.getElementById("modal");
    const modalTitulo = document.getElementById("modal-titulo");
    const modalDescripcion = document.getElementById("modal-descripcion");
    const modalImagenes = document.getElementById("modal-imagenes");

    modalTitulo.textContent = habitacion.nombre;
    modalDescripcion.innerHTML = `
        ${habitacion.descripcion}
        <br><br>
        <p><strong>Precio: ${habitacion.precio}</strong></p>
        <p style="font-size:13px;color:#666">Para reservar, regístrate e inicia sesión; nuestro equipo la asignará a tu cuenta.</p>
    `;

    modalImagenes.innerHTML = "";
    habitacion.imagenes.forEach(imgSrc => {
        const img = document.createElement("img");
        img.src = imgSrc;
        modalImagenes.appendChild(img);
    });

    modal.style.display = "flex";
}

// Cerrar el modal
document.getElementById("cerrar-modal").addEventListener("click", () => {
    document.getElementById("modal").style.display = "none";
});

// Cerrar el modal al hacer clic fuera del contenido
window.addEventListener("click", (event) => {
    const modal = document.getElementById("modal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Ejecutar al cargar la página
mostrarHabitaciones();