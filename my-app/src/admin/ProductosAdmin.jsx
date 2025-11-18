import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const toBase64 = (archivo) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(archivo);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export default function ProductosAdmin() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showCritical, setShowCritical] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    precio: "",
    imagen: "",
    qty: 0,
    categoria: "",
  });

  async function cargarProductos() {
    const res = await fetch("http://localhost:8080/api/productos");
    const data = await res.json();
    setProductos(data);
  }

  async function cargarCategorias() {
    const res = await fetch("http://localhost:8080/api/categorias");
    const data = await res.json();
    setCategorias(data);
  }

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  const resetForm = () =>
    setForm({
      titulo: "",
      descripcion: "",
      precio: "",
      imagen: "",
      qty: 0,
      categoria: "",
    });

  const handleCreate = async (e) => {
    e.preventDefault();

    await fetch("http://localhost:8080/api/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form), 
    });

    cargarProductos();
    resetForm();
    setShowCreate(false);
  };

  const openEdit = (p) => {
    setSelected(p);
    setForm({
      titulo: p.titulo,
      descripcion: p.descripcion,
      precio: p.precio,
      imagen: p.imagen,
      qty: p.qty,
      categoria: p.categoria,
    });
    setShowEdit(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selected) return;

    await fetch(`http://localhost:8080/api/productos/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    cargarProductos();
    setShowEdit(false);
    setSelected(null);
    resetForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar producto?")) return;

    await fetch(`http://localhost:8080/api/productos/${id}`, {
      method: "DELETE",
    });

    cargarProductos();
  };

  const productosCriticos = productos.filter((p) => (p.qty || 0) <= 4);

  const totalProductos = productos.length;
  const totalStock = productos.reduce((sum, p) => sum + (p.qty || 0), 0);
  const valorInventario = productos.reduce(
    (sum, p) => sum + p.precio * (p.qty || 0),
    0
  );

  const handleFileChange = async (archivo) => {
    if (archivo) {
      const base64 = await toBase64(archivo);
      setForm({ ...form, imagen: base64 }); 
    }
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Administrar Productos</h2>
        <div>
          <button className="btn btn-primary me-2" onClick={() => setShowCreate(true)}>
            Nuevo Producto
          </button>
          <button className="btn btn-danger me-2" onClick={() => setShowCritical(true)}>
            Productos Críticos
          </button>
          <button className="btn btn-info me-2" onClick={() => setShowReport(true)}>
            Ver Reporte
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Título</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th className="text-end">Precio</th>
              <th className="text-end">Cantidad</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No hay productos
                </td>
              </tr>
            ) : (
              productos.map((p) => (
                <tr key={p.id}>
                  <td className="text-center">
                    {p.imagen && (
                      <img
                        src={p.imagen}
                        alt={p.titulo}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          display: "block",
                          margin: "0 auto",
                        }}
                      />
                    )}
                  </td>
                  <td>{p.titulo}</td>
                  <td>{p.descripcion}</td>
                  <td>{p.categoria || "-"}</td>
                  <td className="text-end">${p.precio?.toLocaleString("es-CL")}</td>
                  <td className="text-end">{p.qty || 0}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-warning me-2" onClick={() => openEdit(p)}>
                      Editar
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <ModalProducto
          title="Nuevo Producto"
          form={form}
          setForm={setForm}
          categorias={categorias}
          onClose={() => {
            setShowCreate(false);
            resetForm();
          }}
          onSubmit={handleCreate}
          handleFileChange={handleFileChange}
        />
      )}

      {showEdit && selected && (
        <ModalProducto
          title="Editar Producto"
          form={form}
          setForm={setForm}
          categorias={categorias}
          onClose={() => {
            setShowEdit(false);
            setSelected(null);
            resetForm();
          }}
          onSubmit={handleEdit}
          handleFileChange={handleFileChange}
        />
      )}

      {showCritical && (
        <ModalSimple title="Productos Crítticos" onClose={() => setShowCritical(false)}>
          {productosCriticos.length === 0 ? (
            <p>No hay productos críticos</p>
          ) : (
            <ul>
              {productosCriticos.map((p) => (
                <li key={p.id}>
                  {p.titulo} - Cantidad: {p.qty || 0}
                </li>
              ))}
            </ul>
          )}
        </ModalSimple>
      )}

      {showReport && (
        <ModalSimple title="Reporte de Inventario" onClose={() => setShowReport(false)}>
          <p>
            <strong>Total de productos:</strong> {totalProductos}
          </p>
          <p>
            <strong>Stock total:</strong> {totalStock}
          </p>
          <p>
            <strong>Valor total inventario:</strong> ${valorInventario.toLocaleString("es-CL")}
          </p>
        </ModalSimple>
      )}
    </div>
  );
}

function ModalProducto({ title, form, setForm, categorias, onClose, onSubmit, handleFileChange }) {
  return (
    <>
      <div className="modal-backdrop fade show" />
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-scrollable">
          <form className="modal-content" onSubmit={onSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="mb-2">
                <label className="form-label">Título</label>
                <input
                  className="form-control"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  required
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Precio</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                  required
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Cantidad</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.qty}
                  onChange={(e) => setForm({ ...form, qty: e.target.value })}
                  required
                />
              </div>

              <div className="mb-2">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  required
                >
                  <option value="">Seleccione categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.nombre}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-2">
                <label className="form-label">Imagen</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                />
                {form.imagen && (
                  <img
                    src={form.imagen}
                    alt="preview"
                    style={{
                      width: "80px",
                      height: "80px",
                      marginTop: 5,
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                  />
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cerrar
              </button>
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

function ModalSimple({ title, onClose, children }) {
  return (
    <>
      <div className="modal-backdrop fade show" />
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">{children}</div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
