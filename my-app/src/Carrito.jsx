import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./styles/main.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Carrito() {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const [cliente, setCliente] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    calle: "",
    departamento: "",
    region: "",
    comuna: "",
    indicaciones: "",
    pago: 0,
  });

  const formatearPrecio = (n) => "$" + Number(n).toLocaleString("es-CL");

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/productos");
        const data = await res.json();
        setProductos(data);
        localStorage.setItem("app_products", JSON.stringify(data));
      } catch (err) {
        const raw = localStorage.getItem("app_products");
        if (raw) setProductos(JSON.parse(raw));
      }
    };
    cargarProductos();
  }, []);

  const readCart = () => {
    const raw = localStorage.getItem("cart");
    return raw ? JSON.parse(raw) : [];
  };

  const writeCart = (newCart) => {
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);
    actualizarContador();
  };

  const actualizarContador = () => {
    const raw = localStorage.getItem("cart");
    const c = raw ? JSON.parse(raw) : [];
    const cnt = document.getElementById("contador");
    if (cnt) cnt.textContent = c.reduce((s, i) => s + i.qty, 0);
  };

  useEffect(() => {
    setCart(readCart());

    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
    if (usuarioActual) {
      setCliente((p) => ({
        ...p,
        nombre: usuarioActual.nombre,
        correo: usuarioActual.email,
        region: usuarioActual.region,
        comuna: usuarioActual.comuna,
      }));
    }

    actualizarContador();
  }, []);

  useEffect(() => {
    let totalTemp = 0;
    cart.forEach((item) => {
      const prod = productos.find((p) => p.id === item.id);
      if (prod) totalTemp += prod.precio * item.qty;
    });
    setTotal(totalTemp);
  }, [cart, productos]);

  const changeQty = (id, qty) => {
    qty = Math.max(1, Number(qty));
    writeCart(cart.map((c) => (c.id === id ? { ...c, qty } : c)));
  };

  const removeFromCart = (id) => {
    writeCart(cart.filter((c) => c.id !== id));
  };

  const clearCart = () => {
    writeCart([]);
  };

  const handlePago = async (e) => {
    e.preventDefault();

    if (Number(cliente.pago) !== total) {
      setErrorModal(true);
      return;
    }

    const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));

    const fecha = new Date();
    
    const fechaFormateada =
      fecha.getDate().toString().padStart(2, "0") +
      "-" +
      (fecha.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      fecha.getFullYear();

    const orden = {
      usuarioId: usuarioActual?.id || null,
      fecha: fechaFormateada,
      total: total,

      nombre: cliente.nombre,
      apellido: cliente.apellido,
      correo: cliente.correo,
      calle: cliente.calle,
      departamento: cliente.departamento,
      region: cliente.region,
      comuna: cliente.comuna,
      indicaciones: cliente.indicaciones,

      productos: cart.map((item) => {
        const prod = productos.find((p) => p.id === item.id);
        return {
          titulo: prod.titulo,
          qty: item.qty,
          precio: prod.precio,
        };
      }),
    };

    try {
      await fetch("http://localhost:8080/api/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orden),
      });

      clearCart();
      setShowModal(false);
      setSuccessModal(true);
      actualizarContador();
    } catch (err) {
      setErrorModal(true);
    }
  };
  return (
    <div id="page-wrapper" className="is-preload homepage">
      <div className="img-fondo">
        <div className="wrapper">
          <div className="container mt-4">
            <h1>Carrito</h1>
            <div className="list-group mb-3">
              {cart.length === 0 ? (
                <div className="alert alert-info">El carrito está vacío.</div>
              ) : (
                cart.map((item) => {
                  const prod = productos.find((p) => p.id === item.id);
                  if (!prod) return null;
                  return (
                    <div
                      key={item.id}
                      className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                      <div className="d-flex align-items-center">
                        <img
                          src={prod.imagen}
                          alt={prod.titulo}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            marginRight: 12,
                          }}/>
                        <div>
                          <strong>{prod.titulo}</strong>
                          <div>{formatearPrecio(prod.precio)}</div>
                        </div>
                      </div>
                      <div className="d-flex">
                        <input
                          type="number"
                          className="form-control"
                          min={1}
                          style={{ width: 80 }}
                          value={item.qty}
                          onChange={(e) => changeQty(item.id, e.target.value)}/>
                        <button
                          className="btn btn-danger btn-sm ms-2"
                          onClick={() => removeFromCart(item.id)}>
                          X
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <h4>Total: {formatearPrecio(total)}</h4>
            <button
              className="btn btn-primary w-100 mt-3"
              disabled={cart.length === 0}
              onClick={() => setShowModal(true)}>
              Pagar
            </button>
            <button
              className="btn btn-secondary w-100 mt-2"
              disabled={cart.length === 0}
              onClick={clearCart}>
              Vaciar Carrito
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-lg">
            <form className="modal-content" onSubmit={handlePago}>
              <div className="modal-header">
                <h5 className="modal-title">Datos de Pago</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}/>
              </div>
              <div
                className="modal-body"
                style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <h6>Productos en el carrito:</h6>
                <ul>
                  {cart.map((item) => {
                    const prod = productos.find((p) => p.id === item.id);
                    if (!prod) return null;
                    return (
                      <li key={item.id}>
                        {prod.titulo} — {item.qty} x {formatearPrecio(prod.precio)}
                      </li>
                    );
                  })}
                </ul>
                <h6 className="mt-2">Total a pagar: {formatearPrecio(total)}</h6>
                <hr/>
                <h6>Datos del cliente:</h6>
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <input
                      className="form-control"
                      placeholder="Nombre"
                      value={cliente.nombre}
                      onChange={(e) =>
                        setCliente({ ...cliente, nombre: e.target.value })
                      }
                      required/>
                  </div>
                  <div className="col-md-6 mb-2">
                    <input
                      className="form-control"
                      placeholder="Apellido"
                      value={cliente.apellido}
                      onChange={(e) =>
                        setCliente({ ...cliente, apellido: e.target.value })
                      }/>
                  </div>
                  <div className="col-md-12 mb-2">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Correo"
                      value={cliente.correo}
                      onChange={(e) =>
                        setCliente({ ...cliente, correo: e.target.value })
                      }
                      required/>
                  </div>
                  <div className="col-md-6 mb-2">
                    <input
                      className="form-control"
                      placeholder="Calle"
                      value={cliente.calle}
                      onChange={(e) =>
                        setCliente({ ...cliente, calle: e.target.value })
                      }
                      required/>
                  </div>
                  <div className="col-md-6 mb-2">
                    <input
                      className="form-control"
                      placeholder="Departamento"
                      value={cliente.departamento}
                      onChange={(e) =>
                        setCliente({
                          ...cliente,
                          departamento: e.target.value,
                        })
                      }/>
                  </div>
                  <div className="col-md-6 mb-2">
                    <input
                      className="form-control"
                      placeholder="Región"
                      value={cliente.region}
                      onChange={(e) =>
                        setCliente({ ...cliente, region: e.target.value })
                      }
                      required/>
                  </div>
                  <div className="col-md-6 mb-2">
                    <input
                      className="form-control"
                      placeholder="Comuna"
                      value={cliente.comuna}
                      onChange={(e) =>
                        setCliente({ ...cliente, comuna: e.target.value })
                      }
                      required/>
                  </div>
                  <div className="col-md-12 mb-2">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Monto ingresado"
                      value={cliente.pago}
                      onChange={(e) =>
                        setCliente({ ...cliente, pago: e.target.value })
                      }
                      required/>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirmar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {errorModal && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Error</h5>
                <button className="btn-close" onClick={() => setErrorModal(false)} />
              </div>
              <div className="modal-body">Monto incorrecto.</div>
            </div>
          </div>
        </div>
      )}
      {successModal && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5>¡Pago exitoso!</h5>
                <button className="btn-close" onClick={() => setSuccessModal(false)} />
              </div>
              <div className="modal-body">Gracias por tu compra.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
