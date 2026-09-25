import React, { useState } from "react";
import { updateEvent } from "@/lib/api/events/action";
import Swal from "sweetalert2";
import { FiEdit, FiX, FiCheckCircle } from "react-icons/fi";

export default function EditEventModal({ event, onClose, onUpdateSuccess }) {
  const [formData, setFormData] = useState({ ...event });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const { _id, ...updatedData } = formData;
      const res = await updateEvent(updatedData, _id);

      if (res) {
        onUpdateSuccess(formData);
        onClose();

        Swal.fire({
          title: "Updated!",
          text: "Event details updated successfully.",
          icon: "success",
          background: "#131927",
          color: "#f3f4f6",
          confirmButtonColor: "#ec4899",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to update event details.",
        icon: "error",
        background: "#131927",
        color: "#f3f4f6",
        confirmButtonColor: "#f43f5e",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#131927] border border-gray-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FiEdit className="text-pink-500" /> Edit Event Details
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              required
              className="w-full bg-[#0B0F17] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500 transition"
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category || ""}
                onChange={handleChange}
                required
                className="w-full bg-[#0B0F17] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                required
                className="w-full bg-[#0B0F17] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500 transition"
              />
            </div>
          </div>

          {/* Date, Price, Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Date
              </label>
              <input
                type="text"
                name="date"
                value={formData.date || ""}
                onChange={handleChange}
                required
                className="w-full bg-[#0B0F17] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Ticket Price ($)
              </label>
              <input
                type="number"
                name="ticketPrice"
                value={formData.ticketPrice || ""}
                onChange={handleChange}
                required
                className="w-full bg-[#0B0F17] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Seats Capacity
              </label>
              <input
                type="number"
                name="seats"
                value={formData.seats || ""}
                onChange={handleChange}
                required
                className="w-full bg-[#0B0F17] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500 transition"
              />
            </div>
          </div>

          {/* Image Banner URL */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Banner Image URL
            </label>
            <input
              type="text"
              name="banner"
              value={formData.banner || ""}
              onChange={handleChange}
              className="w-full bg-[#0B0F17] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500 transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-pink-500/20 disabled:opacity-50"
            >
              {isUpdating ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <FiCheckCircle size={16} />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}