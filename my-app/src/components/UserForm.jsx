import { useState, useEffect } from "react";

function UserForm({ selectedUser, onSaveComplete }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContasena] = useState("");
  const [telefono, setTelefono] = useState("");
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");


  useEffect(() => {
    if (selectedUser) {
      setNombre(selectedUser.nombre);
      setEmail(selectedUser.email);
      setContrasena(selectedUser.contrasena || "");
      setTelefono(selectedUser.telefono || null);
      setRegion(selectedUser.region);
      setComuna(selectedComuna.comuna);
    } else {
      setNombre("");
      setEmail("");
      setContrasena("");
      setTelefono("");
      setRegion("");
      setComuna("");
    }
  }, [selectedUser]);

 const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:8080/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  setFilePath(data.path);   // Esto lo mandas a la API
  setPreview(data.path);    // Esto sirve para mostrar la previsualización
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newUser = { nonmbre, email, contrasena, telefono, region, comuna};

    try {
      const response = await fetch(
        selectedBook
          ? `http://localhost:8080/api/usuarios/${selectedUser.id}`
          : "http://localhost:8080/api/usuarios",
        {
          method: selectedBook ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        }
      );

      if (!response.ok) throw new Error("Error al guardar el libro");

      const data = await response.json();
      setMessage(selectedBook ? "Usuario actualizado" : "Usuario creado con ID: " + data.id);
      onSaveComplete();
    } catch (error) {
      setMessage("Error al guardar el Usuario");
      console.error(error);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>{selectedBook ? "Editar Usuario" : "Agregar Usuario"}</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Título:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Autor:</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Imagen:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {preview && (
          <div style={{ marginTop: "10px" }}>
            <img
              src={preview}
              alt="Vista previa"
              style={{ width: "100%", maxWidth: "200px", borderRadius: "8px" }}
            />
            <p style={{ fontSize: "0.8rem" }}>{filePath}</p>
          </div>
        )}

        <button type="submit">
          {selectedBook ? "Actualizar" : "Guardar"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default BookForm;
