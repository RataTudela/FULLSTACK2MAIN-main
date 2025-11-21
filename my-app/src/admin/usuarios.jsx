import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    contrasena: "",
    telefono: "",
    region: "",
    comuna: "",
  });

  async function loadUsers() {
    const res = await fetch("http://localhost:8080/api/usuarios");
    const data = await res.json();
    setUsers(data);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () =>
    setForm({
      nombre: "",
      email: "",
      contrasena: "",
      telefono: "",
      region: "",
      comuna: "",
    });

  const handleCreate = async (e) => {
    e.preventDefault();

    await fetch("http://localhost:8080/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    await loadUsers();
    resetForm();
    setShowCreate(false);
  };

  const openEdit = (u) => {
    setSelected(u);
    setForm({
      nombre: u.nombre ?? "",
      email: u.email ?? "",
      contrasena: u.contrasena ?? "",
      telefono: u.telefono ?? "",
      region: u.region ?? "",
      comuna: u.comuna ?? "",
    });
    setShowEdit(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    await fetch(`http://localhost:8080/api/usuarios/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    await loadUsers();
    resetForm();
    setSelected(null);
    setShowEdit(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    await fetch(`http://localhost:8080/api/usuarios/${id}`, {
      method: "DELETE",
    });
    await loadUsers();
  };
  const openHistory = (u) => {
    setSelected(u);
    setShowHistory(true);
  };
  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Administrar Usuarios</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          Nuevo Usuario
        </button>
      </div>
      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Región / Comuna</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center">No hay usuarios</td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{u.telefono}</td>
                <td>{u.region} / {u.comuna}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-info me-2" onClick={() => openHistory(u)}>
                    Historial
                  </button>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => openEdit(u)}>
                    Editar
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showCreate && (
        <ModalUsuario
          title="Crear Usuario"
          form={form}
          setForm={setForm}
          onSubmit={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
      {showEdit && selected && (
        <ModalUsuario
          title="Editar Usuario"
          form={form}
          setForm={setForm}
          onSubmit={handleEdit}
          onClose={() => {
            resetForm();
            setShowEdit(false);
          }}
        />
      )}
      {showHistory && selected && (
        <ModalHistorial user={selected} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}
function ModalUsuario({ title, form, setForm, onSubmit, onClose }) {
  return (
    <>
      <div className="modal-backdrop fade show" />
      <div className="modal d-block">
        <div className="modal-dialog">
          <form className="modal-content" onSubmit={onSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              <label className="form-label">Nombre</label>
              <input className="form-control mb-2" value={form.nombre}
                     onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              <label className="form-label">Email</label>
              <input className="form-control mb-2" type="email" value={form.email}
                     onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <label className="form-label">Contraseña</label>
              <input className="form-control mb-2" type="password" value={form.contrasena}
                     onChange={(e) => setForm({ ...form, contrasena: e.target.value })} required />
              <label className="form-label">Teléfono</label>
              <input className="form-control mb-2" value={form.telefono}
                     onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              <div className="row">
                <div className="col">
                  <label className="form-label">Región</label>
                  <input className="form-control mb-2" value={form.region}
                         onChange={(e) => setForm({ ...form, region: e.target.value })} />
                </div>
                <div className="col">
                  <label className="form-label">Comuna</label>
                  <input className="form-control mb-2" value={form.comuna}
                         onChange={(e) => setForm({ ...form, comuna: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
              <button type="submit" className="btn btn-primary">
                {title.includes("Editar") ? "Guardar" : "Crear"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
function ModalHistorial({ user, onClose }) {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/ordenes/usuario/${user.id}`);
        const data = await res.json();
        setOrdenes(data);
      } catch (err) {
        console.error("Error cargando historial:", err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [user.id]);

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div className="modal d-block">
        <div className="modal-dialog modal-lg">
          <div className="modal-content" style={{ maxHeight: "80vh", overflowY: "auto" }}>
            
            <div className="modal-header">
              <h5 className="modal-title">Historial — {user.nombre}</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {loading && (
                <div className="alert alert-info">Cargando historial...</div>
              )}
              {!loading && ordenes.length === 0 && (
                <div className="alert alert-warning">Este usuario no tiene compras registradas.</div>
              )}
              {!loading && ordenes.length > 0 && (
                <div className="mt-2">
                  {ordenes.map((o) => (
                    <div key={o.id} className="p-3 mb-3 border rounded shadow-sm bg-white">
                      <h5 className="mb-1">
                        Orden #{o.id} — {o.fecha}
                      </h5>
                      <h6 className="text-success mb-3">
                        Total: ${o.total.toLocaleString("es-CL")}
                      </h6>
                      <h6>Productos comprados:</h6>
                      <table className="table table-sm table-bordered mb-3">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio unidad</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {o.productos.map((p, index) => (
                            <tr key={index}>
                              <td>{p.titulo}</td>
                              <td>{p.qty}</td>
                              <td>${p.precio.toLocaleString("es-CL")}</td>
                              <td>${(p.precio * p.qty).toLocaleString("es-CL")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <h6>Dirección:</h6>
                      <p className="mb-0">
                        {o.calle} {o.departamento && `, ${o.departamento}`}<br />
                        {o.comuna}, {o.region}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

