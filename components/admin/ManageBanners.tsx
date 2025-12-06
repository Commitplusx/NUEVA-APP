import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdminBanners } from '../../hooks/useAdminBanners';
import { useRestaurants } from '../../hooks/useRestaurants';
import { Banner } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Spinner } from '../Spinner';
import * as LucideIcons from 'lucide-react';
import { uploadBannerImage } from '../../services/api';

const BannerForm: React.FC<{
    banner?: Banner | null;
    onSave: () => void;
    onCancel: () => void;
}> = ({ banner, onSave, onCancel }) => {
    const { showToast } = useAppContext();
    const { addBanner, updateBanner } = useAdminBanners();
    const { restaurants } = useRestaurants();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(banner?.image_url || null);
    const [linkUrl, setLinkUrl] = useState(banner?.link_url || '');
    const [displayOrder, setDisplayOrder] = useState(banner?.display_order || 1);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(banner?.restaurant_id || null);
    const [isActive, setIsActive] = useState(banner?.is_active ?? true);
    const [isSaving, setIsSaving] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile && !banner) {
            showToast('Debes seleccionar una imagen.', 'error');
            return;
        }

        setIsSaving(true);
        try {
            let imageUrl = banner?.image_url || '';
            if (imageFile) {
                imageUrl = await uploadBannerImage(imageFile);
            }

            if (banner) {
                await updateBanner(banner.id, {
                    image_url: imageUrl,
                    link_url: linkUrl,
                    display_order: displayOrder,
                    is_active: isActive,
                    restaurant_id: selectedRestaurantId,
                });
                showToast('Banner actualizado!', 'success');
            } else {
                await addBanner({
                    image_url: imageUrl,
                    link_url: linkUrl,
                    display_order: displayOrder,
                    is_active: isActive,
                    restaurant_id: selectedRestaurantId,
                });
                showToast('Banner agregado!', 'success');
            }
            onSave();
        } catch (error) {
            console.error('Error saving banner:', error);
            showToast('Error al guardar el banner.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg md:max-w-2xl transform transition-all animate-modal-pop max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-800">{banner ? 'Editar Banner' : 'Nuevo Banner'}</h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Imagen del Banner</label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors relative overflow-hidden">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <LucideIcons.UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click para subir</span></p>
                                            <p className="text-xs text-gray-500">PNG, JPG (MAX. 2MB)</p>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Restaurante (Opcional)</label>
                                <select
                                    value={selectedRestaurantId || ''}
                                    onChange={e => setSelectedRestaurantId(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm md:text-base"
                                >
                                    <option value="">-- Ninguno --</option>
                                    {restaurants.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Orden de Visualización</label>
                                <input type="number" value={displayOrder} onChange={e => setDisplayOrder(Number(e.target.value))} className="w-full px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm md:text-base" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Link (Opcional)</label>
                            <input type="text" placeholder="https://..." value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="w-full px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm md:text-base" />
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-700">Activo</span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onCancel} className="px-6 py-2.5 text-gray-700 font-semibold bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" disabled={isSaving} className="px-6 py-2.5 text-white font-semibold bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                                {isSaving ? 'Guardando...' : (banner ? 'Actualizar' : 'Guardar')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const BannerList: React.FC<{
    banners: Banner[];
    onDelete: (id: number) => void;
    onEdit: (banner: Banner) => void;
    onToggleStatus: (id: number, isActive: boolean) => void;
}> = ({ banners, onDelete, onEdit, onToggleStatus }) => {
    const { restaurants } = useRestaurants();

    if (banners.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
                    <LucideIcons.Image className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No hay banners</h3>
                <p className="text-gray-500 mt-1">Agrega banners para promocionar contenido.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map(banner => {
                const restaurantName = restaurants.find(r => r.id === banner.restaurant_id)?.name;

                return (
                    <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group flex flex-col">
                        <div className="relative h-40 bg-gray-100 group-hover:opacity-90 transition-opacity cursor-pointer" onClick={() => onEdit(banner)}>
                            <img src={banner.image_url} alt="Banner" className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 flex gap-2">
                                <span className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                                    Orden: {banner.display_order}
                                </span>
                                {!banner.is_active && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md shadow-sm">
                                        Inactivo
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                            <div className="flex-grow mb-4">
                                {restaurantName && (
                                    <div className="mb-1">
                                        <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                                            {restaurantName}
                                        </span>
                                    </div>
                                )}
                                <div className="min-w-0">
                                    {banner.link_url ? (
                                        <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-purple-600 hover:underline truncate block flex items-center gap-1">
                                            <LucideIcons.Link className="w-3 h-3" />
                                            {banner.link_url}
                                        </a>
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">Sin enlace</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                <div className="flex items-center gap-2">
                                    <label className="relative inline-flex items-center cursor-pointer" title="Activar/Desactivar">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={banner.is_active}
                                            onChange={(e) => onToggleStatus(banner.id, e.target.checked)}
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                                    </label>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => onEdit(banner)} className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Editar">
                                        <LucideIcons.Edit3 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => onDelete(banner.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                        <LucideIcons.Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const ManageBanners: React.FC = () => {
    const { banners, loading, error, deleteBanner, updateBanner } = useAdminBanners();
    const { showToast } = useAppContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

    const action = searchParams.get('action');
    const isFormOpen = action === 'new' || action === 'edit';

    const handleAddNew = () => {
        setEditingBanner(null);
        setSearchParams({ action: 'new' });
    };

    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner);
        setSearchParams({ action: 'edit' });
    };

    const handleCloseForm = () => {
        setEditingBanner(null);
        setSearchParams({});
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este banner?')) {
            try {
                await deleteBanner(id);
                showToast('Banner eliminado.', 'success');
            } catch (error) {
                console.error('Error deleting banner:', error);
                showToast('Error al eliminar.', 'error');
            }
        }
    };

    const handleToggleStatus = async (id: number, isActive: boolean) => {
        try {
            await updateBanner(id, { is_active: isActive });
            showToast(isActive ? 'Banner activado' : 'Banner desactivado', 'success');
        } catch (error) {
            console.error('Error toggling banner status:', error);
            showToast('Error al cambiar estado.', 'error');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Banners</h1>
                <button
                    onClick={handleAddNew}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:-translate-y-0.5"
                >
                    <LucideIcons.Plus className="w-5 h-5" />
                    <span>Nuevo Banner</span>
                </button>
            </div>

            {isFormOpen && (
                <BannerForm
                    banner={editingBanner}
                    onSave={handleCloseForm}
                    onCancel={handleCloseForm}
                />
            )}

            <div className="bg-transparent">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spinner />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center">
                        <LucideIcons.AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                        <h3 className="text-lg font-bold text-red-800 mb-2">Error al Cargar</h3>
                        <p className="text-red-600">{error}</p>
                    </div>
                ) : (
                    <BannerList
                        banners={banners}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onToggleStatus={handleToggleStatus}
                    />
                )}
            </div>
        </div>
    );
};
