import React, { useEffect, useState } from "react";

export default function Reportes() {
    const [contactos, setContactos] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarReportes = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/reportes");
            const data = await res.json();
            const ordenados = data.sort(
                (a, b) => new Date(b.fecha) - new Date(a.fecha)
            );

            setContactos(ordenados);
        } catch (err) {
            console.error("Error cargando reportes:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarReportes();
    }, []);
    return (
        <div className="container my-4">
            <h2>Reportes de Contacto</h2>
            {loading && (
                <div className="alert alert-info">
                    Cargando mensajes
                </div>
            )}
            {!loading && contactos.length === 0 && (
                <div className="alert alert-warning">
                    No hay mensajes enviados.
                </div>
            )}
            {!loading &&
                contactos.map((c) => (
                    <div key={c.id} className="card mb-3 shadow-sm">
                        <div className="card-header">
                            <strong>{c.nombre}</strong> — {c.email}
                        </div>
                        <div className="card-body">
                            <p>{c.texto}</p>
                            <small className="text-muted">
                                Enviado el: {new Date(c.fecha).toLocaleString()}
                            </small>
                        </div>
                    </div>
                ))}
        </div>
    );
}
