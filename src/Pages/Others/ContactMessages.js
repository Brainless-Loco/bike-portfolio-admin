import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../Utils/Firebase/Firebase";
import ContactMessageModal from "../../Components/Modal/ContactMessageModal";
import ContactMessageCard from "../../Components/ContactMessages/ContactMessageCard";
import { Box, Typography } from "@mui/material";
import Swal from "sweetalert2";

const ContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const fetchMessages = async () => {
            const querySnapshot = await getDocs(collection(db, "ContactMessages"));
            const messagesData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Sort messages by createdAt (newest first)
            messagesData.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
            setMessages(messagesData);
        };

        fetchMessages();
    }, []);

    const handleView = (message) => {
        setSelectedMessage(message);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This message will be permanently deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteDoc(doc(db, "ContactMessages", id));
                setMessages(messages.filter((msg) => msg.id !== id));
                Swal.fire("Deleted!", "The message has been deleted.", "success");
            }
        });
    };

    return (
        <div className="p-10 min-h-[95vh]">
            <Typography color="#0c2461" variant="h4" sx={{ fontWeight: "bold", mb: 3, borderBottom: "3px solid #0c2461", pb: 1 }}>
                Contact Messages
            </Typography>

            <Box className="flex gap-5 flex-wrap">
                {messages.map((msg) => (
                    <ContactMessageCard key={msg.id} message={msg} onView={handleView} onDelete={handleDelete} />
                ))}
            </Box>

            {/* Modal Component */}
            <ContactMessageModal open={modalOpen} handleClose={() => setModalOpen(false)} message={selectedMessage} />
        </div>
    );
};

export default ContactMessages;
