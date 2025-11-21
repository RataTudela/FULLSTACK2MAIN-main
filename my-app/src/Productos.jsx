import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./styles/main.css";
import "./styles/CssRegistro.css";
import "./styles/CssProducto.css";

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resProd = await fetch("http://localhost:8080/api/productos");
        const dataProd = await resProd.json();
        setProductos(dataProd);
        localStorage.setItem("app_products", JSON.stringify(dataProd));

        const resCat = await fetch("http://localhost:8080/api/categorias");
        const dataCat = await resCat.json();
        setCategorias(dataCat);
        localStorage.setItem("app_categorias", JSON.stringify(dataCat));

      } catch (err) {
        console.error("Error cargando API, usando datos locales:", err);
        const rawProducts = localStorage.getItem("app_products");
        if (rawProducts) setProductos(JSON.parse(rawProducts));

        const rawCategorias = localStorage.getItem("app_categorias");
        if (rawCategorias) setCategorias(JSON.parse(rawCategorias));
      }
    };

    cargarDatos();
  }, []);

  const agregar = (id) => {
    const raw = localStorage.getItem("cart");
    let c = raw ? JSON.parse(raw) : [];
    const ex = c.find((i) => i.id === id);
    if (ex) ex.qty += 1;
    else c.push({ id: id, qty: 1 });
    localStorage.setItem("cart", JSON.stringify(c));

    const cnt = document.getElementById("contador");
    if (cnt) cnt.textContent = c.reduce((s, i) => s + i.qty, 0);
  };

  useEffect(() => {
    const cnt = document.getElementById("contador");
    if (cnt) {
      const raw = localStorage.getItem("cart");
      let c = raw ? JSON.parse(raw) : [];
      cnt.textContent = c.reduce((s, i) => s + i.qty, 0);
    }
  }, []);

  const productosFiltrados =
    categoriaSeleccionada === null
      ? productos
      : productos.filter((p) => {
          if (p.categoria) return p.categoria === categoriaSeleccionada.nombre;
          if (p.categoriaId) return p.categoriaId === categoriaSeleccionada.id;
          if (p.category) return p.category === categoriaSeleccionada.nombre;

          return false;
        });

  return (
    <div className="is-preload homepage">
      <div className="img-fondos">
        <div className="wrapper">
          <h1 className="titulo">Productos</h1>
          <h2 className="subtitulo">Los mejores juegos del mercado</h2>
          <div className="mb-4 d-flex justify-content-center flex-wrap gap-2">
            <button
              className={`btn ${
                categoriaSeleccionada === null ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setCategoriaSeleccionada(null)}
            >
              Todos
            </button>

            {categorias.map((cat) => (
              <button
                key={cat.id}
                className={`btn ${
                  categoriaSeleccionada?.id === cat.id
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setCategoriaSeleccionada(cat)}
              >
                {cat.nombre || cat.name}
              </button>
            ))}
          </div>
          <div className="container">
            {productosFiltrados.length === 0 ? (
              <p className="text-center mt-3">No hay productos disponibles.</p>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4 justify-content-center">
                {productosFiltrados.map((product) => (
                  <div className="col mx-auto" key={product.id}>
                    <div className="card h-100 d-flex flex-column">
                      <Link to={`/detalle-producto/${product.id}`}>
                        <img
                          src={product.imagen || product.image}
                          className="card-img-top"
                          alt={product.titulo || product.title}
                          style={{ height: 200, objectFit: "cover" }}
                        />
                      </Link>

                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title">
                          {product.titulo || product.title}
                        </h5>

                        <p className="card-text">
                          {product.descripcion || product.description}
                        </p>

                        <p className="mt-auto mb-2">
                          <strong>
                            ${(product.precio || product.price).toLocaleString("es-CL")}
                          </strong>
                        </p>

                        <button
                          type="button"
                          className="btn btn-primary btn-sm mt-2"
                          onClick={() => agregar(product.id)}
                        >
                          Comprar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
