import React, { useState, useEffect } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "../components/nav";

const CreateProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [images, setImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [email, setEmail] = useState("");

    const categoriesData = ["Electronics", "Fashion", "Books", "Home Appliances"];

    useEffect(() => {
        if (isEdit) {
            axios
                .get(`http://localhost:8000/api/v2/product/product/${id}`)
                .then((response) => {
                    const p = response.data.product;
                    setName(p.name);
                    setDescription(p.description);
                    setCategory(p.category);
                    setTags(p.tags || "");
                    setPrice(p.price);
                    setStock(p.stock);
                    setEmail(p.email);
                    if (p.images && p.images.length > 0) {
                        setPreviewImages(
                            p.images.map((imgPath) => imgPath.startsWith("http") ? imgPath : `http://localhost:8000${imgPath}`)
                        );
                    }
                })
                .catch((err) => {
                    console.error("Error fetching product:", err);
                    alert("Failed to load product details.");
                });
        }
    }, [id, isEdit]);

    useEffect(() => {
        return () => {
            previewImages.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [previewImages]);

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        setImages((prevImages) => [...prevImages, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewImages((prevPreviews) => [...prevPreviews, ...newPreviews]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("tags", tags.split(",").map(tag => tag.trim()).join(",")); 
        formData.append("price", price);
        formData.append("stock", stock);
        formData.append("email", email);
        images.forEach((image) => formData.append("images", image));

         // ✅ Add Debugging Logs Before Sending Request
    console.log("🚀 Sending Data:");
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }


        try {
            const url = isEdit 
                ? `http://localhost:8000/api/v2/product/update-product/${id}`
                : "http://localhost:8000/api/v2/product/create-product";
            
            const method = isEdit ? "put" : "post";
            
            const response = await axios[method](url, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.status === 200 || response.status === 201) {
                alert(`Product ${isEdit ? "updated" : "created"} successfully!`);
                navigate("/my-products");
            }
        } catch (err) {
            console.error("Error:", err.response ? err.response.data : err.message);
            alert(err.response?.data?.message || "Something went wrong.");
        }
    };

    return (
        <>
            <Nav />
            <div className="w-[90%] max-w-[500px] bg-white shadow rounded p-4 mx-auto">
                <h5 className="text-[24px] font-semibold text-center">
                    {isEdit ? "Edit Product" : "Create Product"}
                </h5>
                <form onSubmit={handleSubmit}>
                    <div className="mt-4">
                        <label className="pb-1 block">Email <span className="text-red-500">*</span></label>
                        <input type="email" value={email} className="w-full p-2 border rounded" onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
                    </div>
                    <div className="mt-4">
                        <label className="pb-1 block">Product Name <span className="text-red-500">*</span></label>
                        <input type="text" value={name} className="w-full p-2 border rounded" onChange={(e) => setName(e.target.value)} placeholder="Enter product name" required />
                    </div>
                    <div className="mt-4">
                        <label className="pb-1 block">Description <span className="text-red-500">*</span></label>
                        <textarea value={description} className="w-full p-2 border rounded" onChange={(e) => setDescription(e.target.value)} placeholder="Enter product description" rows="4" required></textarea>
                    </div>
                    <div className="mt-4">
                        <label className="pb-1 block">Category <span className="text-red-500">*</span></label>
                        <select className="w-full p-2 border rounded" value={category} onChange={(e) => setCategory(e.target.value)} required>
                            <option value="">Choose a category</option>
                            {categoriesData.map((title) => (
                                <option value={title} key={title}>{title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mt-4">
                        <label className="pb-1 block">Upload Images <span className={!isEdit ? "text-red-500" : ""}>*</span></label>
                        <input type="file" id="upload" className="hidden" multiple onChange={handleImagesChange} required={!isEdit} />
                        <label htmlFor="upload" className="cursor-pointer">
                            <AiOutlinePlusCircle size={30} color="#555" />
                        </label>
                        <div className="flex flex-wrap mt-2">
                            {previewImages.map((img, index) => (
                                <img src={img} key={index} alt="Preview" className="w-[100px] h-[100px] object-cover m-2" />
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="w-full mt-4 bg-blue-500 text-white p-2 rounded">
                        {isEdit ? "Save Changes" : "Create"}
                    </button>
                </form>
            </div>
        </>
    );
};

export default CreateProduct;