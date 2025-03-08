// Datos de las habitaciones (40 en total, con descripciones y 9 imágenes placeholder por ahora)
const habitaciones = [
    // Primer piso (7 habitaciones)
    { id: 101, piso: 1, nombre: "Habitación 101", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+101", disponible: true, descripcion: "Habitación luminosa cerca de la entrada principal.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 102, piso: 1, nombre: "Habitación 102", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+102", disponible: false, descripcion: "Espaciosa con vista al patio.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 103, piso: 1, nombre: "Habitación 103", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+103", disponible: true, descripcion: "Ideal para una persona, cerca del baño.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 104, piso: 1, nombre: "Habitación 104", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+104", disponible: true, descripcion: "Tranquila y bien ventilada.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 105, piso: 1, nombre: "Habitación 105", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+105", disponible: false, descripcion: "Con espacio para escritorio.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 106, piso: 1, nombre: "Habitación 106", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+106", disponible: true, descripcion: "Cerca de la cocina compartida.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 107, piso: 1, nombre: "Habitación 107", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+107", disponible: true, descripcion: "Amplia y con buena luz natural.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },

    // Segundo piso (9 habitaciones)
    { id: 201, piso: 2, nombre: "Habitación 201", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+201", disponible: true, descripcion: "Vista a la calle principal.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 202, piso: 2, nombre: "Habitación 202", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+202", disponible: false, descripcion: "Con balcón pequeño.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 203, piso: 2, nombre: "Habitación 203", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+203", disponible: true, descripcion: "Silenciosa, ideal para estudiar.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 204, piso: 2, nombre: "Habitación 204", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+204", disponible: true, descripcion: "Cerca del ascensor.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 205, piso: 2, nombre: "Habitación 205", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+205", disponible: false, descripcion: "Con closet amplio.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 206, piso: 2, nombre: "Habitación 206", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+206", disponible: true, descripcion: "Ventilación natural excelente.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 207, piso: 2, nombre: "Habitación 207", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+207", disponible: true, descripcion: "Cerca de la escalera.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 208, piso: 2, nombre: "Habitación 208", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+208", disponible: false, descripcion: "Con buena iluminación.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 209, piso: 2, nombre: "Habitación 209", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+209", disponible: true, descripcion: "Espaciosa y cómoda.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },

    // Tercer piso (8 habitaciones)
    { id: 301, piso: 3, nombre: "Habitación 301", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+301", disponible: true, descripcion: "Vista panorámica.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 302, piso: 3, nombre: "Habitación 302", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+302", disponible: false, descripcion: "Con espacio para estudio.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 303, piso: 3, nombre: "Habitación 303", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+303", disponible: true, descripcion: "Tranquila y acogedora.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 304, piso: 3, nombre: "Habitación 304", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+304", disponible: true, descripcion: "Cerca del baño compartido.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 305, piso: 3, nombre: "Habitación 305", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+305", disponible: false, descripcion: "Con buena ventilación.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 306, piso: 3, nombre: "Habitación 306", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+306", disponible: true, descripcion: "Ideal para estudiantes.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 307, piso: 3, nombre: "Habitación 307", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+307", disponible: true, descripcion: "Con vista al patio.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 308, piso: 3, nombre: "Habitación 308", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+308", disponible: false, descripcion: "Espaciosa y luminosa.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },

    // Cuarto piso (8 habitaciones)
    { id: 401, piso: 4, nombre: "Habitación 401", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+401", disponible: true, descripcion: "Con vista a la ciudad.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 402, piso: 4, nombre: "Habitación 402", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+402", disponible: false, descripcion: "Cerca del ascensor.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 403, piso: 4, nombre: "Habitación 403", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+403", disponible: true, descripcion: "Silenciosa y cómoda.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 404, piso: 4, nombre: "Habitación 404", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+404", disponible: true, descripcion: "Con balcón pequeño.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 405, piso: 4, nombre: "Habitación 405", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+405", disponible: false, descripcion: "Ideal para trabajar.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 406, piso: 4, nombre: "Habitación 406", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+406", disponible: true, descripcion: "Con buena luz.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 407, piso: 4, nombre: "Habitación 407", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+407", disponible: true, descripcion: "Cerca de la escalera.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 408, piso: 4, nombre: "Habitación 408", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+408", disponible: false, descripcion: "Espaciosa y tranquila.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },

    // Quinto piso (8 habitaciones)
    { id: 501, piso: 5, nombre: "Habitación 501", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+501", disponible: true, descripcion: "Vista panorámica superior.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 502, piso: 5, nombre: "Habitación 502", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+502", disponible: false, descripcion: "Con closet grande.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 503, piso: 5, nombre: "Habitación 503", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+503", disponible: true, descripcion: "Ideal para estudiantes.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 504, piso: 5, nombre: "Habitación 504", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+504", disponible: true, descripcion: "Con buena ventilación.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 505, piso: 5, nombre: "Habitación 505", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+505", disponible: false, descripcion: "Cerca del baño.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 506, piso: 5, nombre: "Habitación 506", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+506", disponible: true, descripcion: "Tranquila y luminosa.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 507, piso: 5, nombre: "Habitación 507", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+507", disponible: true, descripcion: "Con vista al parque.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") },
    { id: 508, piso: 5, nombre: "Habitación 508", precio: "400.000 COP/mes", imagen: "https://via.placeholder.com/300x200?text=Habitación+508", disponible: false, descripcion: "Espaciosa y cómoda.", imagenes: Array(9).fill("https://via.placeholder.com/300x200?text=Img") }
];

// Función para mostrar habitaciones disponibles
function mostrarHabitaciones() {
    const contenedor = document.getElementById("contenedor-habitaciones");
    contenedor.innerHTML = "";

    for (let piso = 1; piso <= 5; piso++) {
        const habitacionesPiso = habitaciones.filter(h => h.piso === piso && h.disponible);
        if (habitacionesPiso.length > 0) {
            const pisoDiv = document.createElement("div");
            pisoDiv.innerHTML = `<h3>Piso ${piso}</h3>`;
            habitacionesPiso.forEach(habitacion => {
                const div = document.createElement("div");
                div.className = "habitacion";
                div.innerHTML = `
                    <img src="${habitacion.imagen}" alt="${habitacion.nombre}">
                    <h3>${habitacion.nombre}</h3>
                    <p>Precio: <strong>${habitacion.precio}</strong></p>
                `;
                div.addEventListener("click", () => mostrarDetalles(habitacion));
                pisoDiv.appendChild(div);
            });
            contenedor.appendChild(pisoDiv);
        }
    }
}

// Función para mostrar detalles en el modal
function mostrarDetalles(habitacion) {
    const modal = document.getElementById("modal");
    const modalTitulo = document.getElementById("modal-titulo");
    const modalDescripcion = document.getElementById("modal-descripcion");
    const modalImagenes = document.getElementById("modal-imagenes");

    modalTitulo.textContent = habitacion.nombre;
    modalDescripcion.textContent = habitacion.descripcion;
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