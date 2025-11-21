import React, { useEffect, useState } from "react";

export default function OrdenesAdmin() {
  const [ordenes, setOrdenes] = useState([]);

  const cargarOrdenes = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/ordenes");
      const data = await res.json();
      setOrdenes(data);
    } catch (error) {
      console.error("Error cargando órdenes:", error);
      setOrdenes([]);
    }
  };

  useEffect(() => {
    cargarOrdenes();
  }, []);

  return (
    <div className="container my-4">
      <h2>Historial de Órdenes</h2>

      {ordenes.length === 0 && (
        <div className="alert alert-info">No hay órdenes registradas.</div>
      )}

      {ordenes.map((o) => (
        <div key={o.id} className="card mb-3">
          <div className="card-header">
            <strong>Orden #{o.id}</strong> - {o.fecha}
          </div>

          <div className="card-body">
            <h5>Cliente:</h5>
            <p>
              {o.nombre} {o.apellido} <br />
              {o.correo} <br />
              {o.calle} {o.departamento} <br />
              {o.comuna}, {o.region} <br />
              {o.indicaciones}
            </p>

            <h5>Productos:</h5>
            <ul>
              {o.productos.map((p, i) => (
                <li key={i}>
                  {p.titulo} - {p.qty} x{" "}
                  {p.precio.toLocaleString("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  })}
                </li>
              ))}
            </ul>

            <h5>
              Total:{" "}
              {o.total.toLocaleString("es-CL", {
                style: "currency",
                currency: "CLP",
              })}
            </h5>
          </div>
        </div>
      ))}
    </div>
  );
}
