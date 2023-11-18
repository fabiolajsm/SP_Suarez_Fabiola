class Persona {
  constructor(id, nombre, apellido, edad) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.edad = edad;
  }

  toString() {
    return `${this.nombre} ${this.apellido}`;
  }
}
class Futbolista extends Persona {
  constructor(id, nombre, apellido, edad, equipo, posicion, cantidadGoles) {
    super(id, nombre, apellido, edad);
    this.equipo = equipo;
    this.posicion = posicion;
    this.cantidadGoles = cantidadGoles;
  }

  toString() {
    return `${super.toString()} - equipo: ${this.equipo}`;
  }
}

class Profesional extends Persona {
  constructor(id, nombre, apellido, edad, titulo, facultad, añoGraduacion) {
    super(id, nombre, apellido, edad);
    this.titulo = titulo;
    this.facultad = facultad;
    this.añoGraduacion = añoGraduacion;
  }

  toString() {
    return `${super.toString()} - titulo: ${this.titulo}`;
  }
}

// Variables globales
let listaElementos = [];
let elementoFormABM;
let formListaChild;
let tipoAccion = "";
const tipoAcciones = {
  alta: "Alta",
  baja: "Borrar",
  modificacion: "Modificación",
};

// Cargar lista
function cargarListaDesdeAPI() {
  mostrarSpinner();
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (xhttp.readyState === 4) {
      if (xhttp.status === 200) {
        const respuestaJSON = xhttp.responseText;
        const lista = JSON.parse(respuestaJSON);
        listaElementos = generarLista(lista);
        ocultarSpinner();
        mostrarLista(listaElementos);
      } else {
        window.alert("Hubo un error al obtener los datos desde la API.");
      }
    }
  };
  xhttp.open("GET", "personasFutbolitasProfesionales.php", true);
  xhttp.send();
}
// Función para generar la lista en memoria segun su tipo desde la respuesta JSON
function generarLista(respuesta) {
  const listaGenerada = [];
  if (respuesta) {
    respuesta.forEach((item) => {
      if (item.hasOwnProperty("equipo")) {
        const futbolista = new Futbolista(
          item.id,
          item.nombre,
          item.apellido,
          item.edad,
          item.equipo,
          item.posicion,
          item.cantidadGoles
        );
        listaGenerada.push(futbolista);
      } else if (item.hasOwnProperty("titulo")) {
        const profesional = new Profesional(
          item.id,
          item.nombre,
          item.apellido,
          item.edad,
          item.titulo,
          item.facultad,
          item.añoGraduacion
        );
        listaGenerada.push(profesional);
      } else {
        const persona = new Persona(
          item.id,
          item.nombre,
          item.apellido,
          item.edad
        );
        listaGenerada.push(persona);
      }
    });
  }
  return listaGenerada;
}
// Función para crear y mostrar la lista de elementos
function mostrarLista(lista) {
  const elementosTable = document.getElementById("elementos");
  elementosTable.innerHTML = "";

  lista.forEach((elemento) => {
    const { id, nombre, apellido, edad } = elemento;
    const {
      equipo = "N/A",
      posicion = "N/A",
      cantidadGoles = "N/A",
      titulo = "N/A",
      facultad = "N/A",
      añoGraduacion = "N/A",
    } = elemento;

    const row = document.createElement("tr");
    const cells = [
      id,
      nombre,
      apellido,
      edad,
      equipo,
      posicion,
      cantidadGoles,
      titulo,
      facultad,
      añoGraduacion,
    ].map((text) => {
      const cell = document.createElement("td");
      cell.textContent = text;
      return cell;
    });
    cells.forEach((cell) => row.appendChild(cell));

    const buttons = ["Modificar", "Eliminar"].map((text) => {
      const cell = document.createElement("td");
      const button = document.createElement("button");
      button.textContent = text;
      button.addEventListener("click", () => {
        text === "Modificar"
          ? modificarElemento(elemento)
          : borrarElemento(elemento);
      });
      cell.appendChild(button);
      return cell;
    });
    row.append(...buttons);
    elementosTable.appendChild(row);
  });
  mostrarFormLista();
}
function borrarElemento(elemento) {
  tipoAccion = tipoAcciones.baja;
  const tipo = elemento instanceof Futbolista ? "Futbolista" : "Profesional";
  mostrarFormularioABM(`Borrar ${tipo}`);
  mostrarInputsSegunTipo(elemento);
}
function modificarElemento(elemento) {
  tipoAccion = tipoAcciones.modificacion;
  const tipo = elemento instanceof Futbolista ? "Futbolista" : "Profesional";
  mostrarFormularioABM(`Modificar ${tipo}`);
  mostrarInputsSegunTipo(elemento);
}
function mostrarInputsSegunTipo(elemento = null) {
  if (elemento === null) return;
  const idInput = document.getElementById("id");
  const nombreInput = document.getElementById("nombre");
  const apellidoInput = document.getElementById("apellido");
  const edadInput = document.getElementById("edad");
  idInput.value = elemento.id;
  nombreInput.value = elemento.nombre || "";
  apellidoInput.value = elemento.apellido || "";
  edadInput.value = elemento.edad || "";

  const camposAMostrar =
    elemento instanceof Futbolista
      ? ["equipo", "posicion", "cantidadGoles"]
      : ["titulo", "facultad", "añoGraduacion"];
  const camposAOcultar =
    elemento instanceof Futbolista
      ? ["titulo", "facultad", "añoGraduacion"]
      : ["equipo", "posicion", "cantidadGoles"];

  camposAMostrar.forEach((campo) => {
    const label = document.querySelector(`label[for="${campo}"]`);
    const input = document.getElementById(campo);
    label.style.display = "block";
    input.style.display = "block";
    input.setAttribute(
      "required",
      tipoAccion === tipoAcciones.modificacion ? "required" : null
    );
    input.value = elemento[campo] || "";
    input.disabled = tipoAccion === tipoAcciones.baja;
  });

  camposAOcultar.forEach((campo) => {
    const label = document.querySelector(`label[for="${campo}"]`);
    const input = document.getElementById(campo);
    label.style.display = "none";
    input.style.display = "none";
    input.value = "";
    input.disabled = tipoAccion === tipoAcciones.baja;
  });
}

/** Agregar, Remover, Mostrar u ocultar Formulario ABM */
function agregarFormABM() {
  if (elementoFormABM) {
    document.body.appendChild(elementoFormABM); // Agrega el elemento de vuelta al DOM
    elementoFormABM = null; // Limpia la referencia al elemento eliminado
  }
}
function removerFormABM() {
  const formularioABM = document.getElementById("formularioABM");
  elementoFormABM = formularioABM;
  formularioABM.remove();
}
function ocultarFormABM() {
  const formularioABM = document.getElementById("formularioABM");
  formularioABM.style.display = "none";
}
function mostrarFormularioABM(titulo) {
  ocultarFormLista();
  mostrarSpinner();
  agregarFormABM();
  eliminarErrores();
  limpiarCamposFormABM();
  const id = document.getElementById("id");
  const idLabel = document.querySelector(`label[for="id"]`);

  if (titulo.includes("Alta")) {
    tipoAccion = tipoAcciones.alta;
    id.style.display = "none";
    idLabel.style.display = "none";
  } else {
    id.style.display = "block";
    idLabel.style.display = "block";
  }

  id.disabled = true;
  document.getElementById("tituloABM").textContent = titulo;
  document.getElementById("tipo").style.display = "block";
  document.getElementById("nombre").disabled = tipoAccion === tipoAcciones.baja;
  document.getElementById("apellido").disabled =
    tipoAccion === tipoAcciones.baja;
  document.getElementById("edad").disabled = tipoAccion === tipoAcciones.baja;

  if (
    tipoAccion === tipoAcciones.modificacion ||
    tipoAccion === tipoAcciones.baja
  ) {
    document.getElementById("tipo").style.display = "none";
  }
  ocultarSpinner();
  const formularioABM = document.getElementById("formularioABM");
  formularioABM.style.display = "block";
}

function eliminarErrores() {
  const camposDeError = [
    "errorNombre",
    "errorApellido",
    "errorEdad",
    "errorTipo",
    "errorEquipo",
    "errorPosicion",
    "errorCantidadGoles",
    "errorTitulo",
    "errorFacultad",
    "errorAñoGraduacion",
  ];
  camposDeError.forEach((campo) => {
    const elementoError = document.querySelector(`label[for="${campo}"]`);
    if (elementoError) {
      elementoError.style.display = "none";
    }
  });
}
function limpiarCamposFormABM() {
  const campos = [
    "id",
    "nombre",
    "apellido",
    "edad",
    "equipo",
    "posicion",
    "cantidadGoles",
    "titulo",
    "facultad",
    "añoGraduacion",
  ];
  const etiquetasAMostrar = [
    "equipo",
    "posicion",
    "cantidadGoles",
    "titulo",
    "facultad",
    "añoGraduacion",
  ];
  const etiquetas = etiquetasAMostrar.map((tipo) =>
    document.querySelector(`label[for="${tipo}"]`)
  );

  campos.forEach((campo) => (document.getElementById(campo).value = ""));
  etiquetas.forEach((etiqueta) => (etiqueta.style.display = "none"));
  etiquetasAMostrar.forEach(
    (tipo) => (document.getElementById(tipo).style.display = "none")
  );
  document.getElementById("tipo").selectedIndex = 0;
}

// Cuando cambia el tipo de usuario que quiere modificar limpia los errores previos y actualiza los campos a mostrar
function handleChangeTipo() {
  eliminarErroresTipo();
  const tipo = document.getElementById("tipo").value;
  const camposABM = [
    "equipo",
    "posicion",
    "cantidadGoles",
    "titulo",
    "facultad",
    "añoGraduacion",
  ];
  camposABM.forEach((campo) => {
    const label = document.querySelector(`label[for="${campo}"]`);
    const input = document.getElementById(campo);
    label.style.display = "none";
    input.style.display = "none";
    input.removeAttribute("required");
  });

  if (tipo === "futbolista") {
    ["equipo", "posicion", "cantidadGoles"].forEach((campo) => {
      const label = document.querySelector(`label[for="${campo}"]`);
      const input = document.getElementById(campo);
      label.style.display = "block";
      input.style.display = "block";
      input.disabled = false;
      input.setAttribute("required", "required");
    });
  } else if (tipo === "profesional") {
    ["titulo", "facultad", "añoGraduacion"].forEach((campo) => {
      const label = document.querySelector(`label[for="${campo}"]`);
      const input = document.getElementById(campo);
      label.style.display = "block";
      input.style.display = "block";
      input.disabled = false;
      input.setAttribute("required", "required");
    });
  }
}
function eliminarErroresTipo() {
  const camposDeError = [
    "errorTipo",
    "errorEquipo",
    "errorPosicion",
    "errorCantidadGoles",
    "errorTitulo",
    "errorFacultad",
    "errorAñoGraduacion",
  ];
  camposDeError.forEach((campo) => {
    const elementoError = document.querySelector(`label[for="${campo}"]`);
    if (elementoError) {
      elementoError.style.display = "none";
    }
  });
}

// Botones de cancelar o aceptar ABM
function btnCancelarABM() {
  removerFormABM();
  mostrarFormLista();
}
function btnAceptarABM(event) {
  event.preventDefault();
  if (validarFormulario()) {
    ocultarFormABM();
    mostrarSpinner();
    ejecutarAccion();
  }
}
// Validaciones antes de hacer cualquier accion:
function validarFormulario() {
  let esValido = true;
  eliminarErrores();
  if (tipoAccion === tipoAcciones.baja) return true;
  const nombreInput = document.getElementById("nombre").value;
  const errorNombre = document.querySelector('label[for="errorNombre"]');
  const apellidoInput = document.getElementById("apellido").value;
  const errorApellido = document.querySelector('label[for="errorApellido"]');
  const edadInput = document.getElementById("edad").value;
  const errorEdad = document.querySelector('label[for="errorEdad"]');

  if (tipoAccion !== tipoAcciones.baja) {
    if (!esTextoValido(nombreInput.trim())) {
      errorNombre.style.display = "block";
      esValido = false;
    }
    if (!esTextoValido(apellidoInput.trim())) {
      errorApellido.style.display = "block";
      esValido = false;
    }
    if (isNaN(edadInput) || edadInput < 16 || edadInput > 80) {
      errorEdad.style.display = "block";
      esValido = false;
    }
  }
  const tipo = document.getElementById("tipo").value;
  const errorTipo = document.querySelector('label[for="errorTipo"]');
  if (
    tipoAccion === tipoAcciones.alta &&
    tipo !== "futbolista" &&
    tipo !== "profesional"
  ) {
    errorTipo.style.display = "block";
    esValido = false;
  } else {
    esValido = validarInputsDelTipo();
  }

  if (tipoAccion === tipoAcciones.modificacion) {
    esValido = validarInputsDelTipo();
  }

  return esValido;
}
function validarInputsDelTipo() {
  const campos = [
    { id: "equipo", labelError: "errorEquipo", validacion: esTextoValido },
    { id: "posicion", labelError: "errorPosicion", validacion: esTextoValido },
    {
      id: "cantidadGoles",
      labelError: "errorCantidadGoles",
      validacion: (value) => value > 0 && value < 100,
    },
    { id: "titulo", labelError: "errorTitulo", validacion: esTextoValido },
    { id: "facultad", labelError: "errorFacultad", validacion: esTextoValido },
    {
      id: "añoGraduacion",
      labelError: "errorAñoGraduacion",
      validacion: (value) => value > 0,
    },
  ];
  let inputsValidos = true;

  campos.forEach((campo) => {
    const inputElement = document.getElementById(campo.id);
    const errorLabel = document.querySelector(
      `label[for="${campo.labelError}"]`
    );

    if (inputElement.style.display !== "none") {
      if (!campo.validacion(inputElement.value)) {
        errorLabel.style.display = "block";
        inputsValidos = false;
      }
    }
  });

  return inputsValidos;
}

function esTextoValido(nombre) {
  // Expresión regular que verifica que el nombre contenga solo letras y espacios
  const regex = /^[a-zA-ZáÁéÉíÍóÓúÚüÜ\s]+$/;
  return nombre ? regex.test(nombre) : false;
}

// Acciones a ejecutar ABM
function ejecutarAccion() {
  switch (tipoAccion) {
    case tipoAcciones.alta:
      procesarAlta();
      break;
    case tipoAcciones.baja:
      procesarBaja();
      break;
    case tipoAcciones.modificacion:
      procesarModificacion();
      break;
    default:
      break;
  }
}

function obtenerDataForm() {
  const id = document.getElementById("id").value;
  const nombre = document.getElementById("nombre").value;
  const apellido = document.getElementById("apellido").value;
  const edad = document.getElementById("edad").value;
  const equipo = document.getElementById("equipo").value;
  const posicion = document.getElementById("posicion").value;
  const cantidadGoles = document.getElementById("cantidadGoles").value;
  const titulo = document.getElementById("titulo").value;
  const facultad = document.getElementById("facultad").value;
  const añoGraduacion = document.getElementById("añoGraduacion").value;

  return {
    id,
    nombre,
    apellido,
    edad,
    equipo,
    posicion,
    cantidadGoles,
    titulo,
    facultad,
    añoGraduacion,
  };
}
// Alta
async function procesarAlta() {
  try {
    const objetoJSON = obtenerDataForm();
    const tipo = document.getElementById("tipo").value;
    const { id, ...restoDatos } = objetoJSON;

    const response = await fetch("personasFutbolitasProfesionales.php", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(restoDatos),
    });

    if (response.ok) {
      const data = await response.json();
      const nuevoElemento =
        tipo === "futbolista"
          ? new Futbolista(
              data.id,
              objetoJSON.nombre,
              objetoJSON.apellido,
              objetoJSON.edad,
              objetoJSON.equipo,
              objetoJSON.posicion,
              objetoJSON.cantidadGoles
            )
          : tipo === "profesional"
          ? new Profesional(
              data.id,
              objetoJSON.nombre,
              objetoJSON.apellido,
              objetoJSON.edad,
              objetoJSON.titulo,
              objetoJSON.facultad,
              objetoJSON.añoGraduacion
            )
          : new Persona(
              data.id,
              objetoJSON.nombre,
              objetoJSON.apellido,
              objetoJSON.edad
            );
      listaElementos.push(nuevoElemento);
    } else {
      alert("No se pudo realizar la operación.");
    }
    ocultarSpinner();
    removerFormABM();
    mostrarLista(listaElementos);
  } catch (error) {
    ocultarSpinner();
    removerFormABM();
    mostrarLista(listaElementos);
    alert(`No se pudo realizar la operación: ${error.message}`);
  }
}
// Baja
function procesarBaja() {
  const id = document.getElementById("id").value;
  fetch("personasFutbolitasProfesionales.php", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  })
    .then((response) => {
      if (response.status === 200) {
        listaElementos = listaElementos.filter(
          (item) => item.id !== Number(id)
        );
      }
      ocultarSpinner();
      ocultarFormABM();
      mostrarLista(listaElementos);
      if (!response.ok) {
        alert("No se pudo realizar la operación.");
      }
    })
    .catch((error) => {
      ocultarSpinner();
      ocultarFormABM();
      mostrarLista(listaElementos);
      alert(`No se pudo realizar la operación: ${error.message}`);
    });
}
// Modificación
function procesarModificacion() {
  const data = obtenerDataForm();
  return new Promise((resolve, reject) => {
    fetch("personasFutbolitasProfesionales.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok && response.status === 200) {
          const elemento = listaElementos.find(
            (item) => item.id === Number(data.id)
          );
          if (elemento) {
            if (elemento instanceof Futbolista && !(data instanceof Futbolista)) {
              const { titulo, facultad, añoGraduacion, ...restoDatos } = data;
              Object.keys(restoDatos).forEach((key) => {
                if (restoDatos[key]) {
                  elemento[key] = restoDatos[key];
                }
              });
            } else if (elemento instanceof Profesional && !(data instanceof Profesional)) {
              const { equipo, posicion, cantidadGoles, ...restoDatos } = data;
              Object.keys(restoDatos).forEach((key) => {
                if (restoDatos[key]) {
                  elemento[key] = restoDatos[key];
                }
              });
            } else {
              Object.keys(data).forEach((key) => {
                if (data[key]) {
                  elemento[key] = data[key];
                }
              });
            }
          }
        } else {
          alert("No se pudo realizar la operación.");
        }
      })
      .catch((error) => {
        console.log("Error en la operación:", error.message);
        alert(`No se pudo realizar la operación: ${error.message}`);
      })
      .finally(() => {
        ocultarSpinner();
        ocultarFormABM();
        mostrarLista(listaElementos);
      });
  });
}

// Ocultar o mostrar Spinner
function ocultarSpinner() {
  const spinner = document.getElementById("spinnerContainer");
  const spinnerData = document.getElementById("spinner");
  spinner.style.display = "none";
  spinnerData.style.display = "none";
}
function mostrarSpinner() {
  const spinner = document.getElementById("spinnerContainer");
  const spinnerData = document.getElementById("spinner");
  spinner.style.display = "flex";
  spinnerData.style.display = "flex";
}
// Ocultar o mostrar FormLista
function ocultarFormLista() {
  const contenedorElementos = document.getElementById("contenedorElementos");
  contenedorElementos.style.display = "none";
}
function mostrarFormLista() {
  const contenedorElementos = document.getElementById("contenedorElementos");
  contenedorElementos.style.display = "block";
}
// Inicialización al cargar la página
cargarListaDesdeAPI();
