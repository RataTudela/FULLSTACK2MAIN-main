import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/productos/${id}`);
        if (!res.ok) throw new Error("No encontrado");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    cargarProducto();
  }, [id]);
  
  useEffect(() => {
    const cargarTodos = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/productos");
        const data = await res.json();
        setProductos(data);
      } catch (e) {
        console.error("Error cargando productos:", e);
      }
    };

    cargarTodos();
  }, []);

  if (loading) return <h2>Cargando</h2>;

  if (!product) {
    return (
      <div className="wrapper">
        <h2>Producto no encontrado</h2>
        <button onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }
  const relacionados = productos
    .filter(p =>
      p.id !== product.id &&  
      p.categoria === product.categoria 
    )
    .slice(0, 4); 
return (
  <div className="img-fondo route-detalle-producto">
    <div className="wrapper" style={{ paddingTop: "120px" }}>
      <div className="contenedor-flex">
        <div className="cajilla-box">
          <img
            src={product.imagen}
            alt={product.titulo}
            style={{ maxWidth: "100%", height: 310, objectFit: "cover" }}
          />
        </div>
        <div className="cajilla2-box">
          <h5 style={{ color: "black" }}>{product.titulo}</h5>
          <p style={{ color: "black" }}>{product.descripcion}</p>
          <p style={{ color: "black" }}>
            <strong>${product.precio.toLocaleString("es-CL")}</strong>
          </p>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>
      <div className="container mt-5">
        <h3 style={{ color: "white", textShadow: "1px 1px 3px black" }}>
          Productos relacionados
        </h3>
        {relacionados.length === 0 && (
          <p className="text-muted">No hay productos relacionados.</p>
        )}
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
          {relacionados.map((p) => (
            <div className="col" key={p.id}>
              <Link
                to={`/detalle-producto/${p.id}`}
                className="card h-100 text-decoration-none"
              >
                <img
                  src={p.imagen}
                  className="card-img-top"
                  style={{ height: 160, objectFit: "cover" }}
                  alt={p.titulo}
                />
                <div className="card-body">
                  <h5 className="card-title">{p.titulo}</h5>
                  <p className="card-text text-muted" style={{ fontSize: "0.9rem" }}>
                    {p.descripcion?.slice(0, 60)}...
                  </p>
                  <strong>${p.precio.toLocaleString("es-CL")}</strong>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
}