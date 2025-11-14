import React from 'react';
import { Page } from '../App';
import { 
    ChevronRightIcon, 
    PackageIcon,
    HeadphonesIcon,
    CreditCardIcon,
    TicketIcon,
    StarIcon,
    CrownIcon,
    LocationIcon,
    DocumentTextIcon,
    BellIcon,
    StoreIcon,
    MotorcycleIcon,
    // FIX: Import UserIcon and SparklesIcon to resolve missing component errors.
    UserIcon,
    SparklesIcon
} from './icons';

interface AccountProps {
    onNavigate: (page: Page) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className="" }) => (
  <div className={`mb-6 ${className}`}>
    <h2 className="px-4 text-xl font-bold text-gray-900 mb-3">{title}</h2>
    <div>{children}</div>
  </div>
);

interface ListItemProps {
    icon: React.ReactNode;
    text: string;
    subtext?: string;
    value?: string;
    onClick?: () => void;
    hasChevron?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({ icon, text, subtext, value, onClick, hasChevron = true }) => {
    const content = (
        <div className="flex items-center p-4 bg-white">
            <div className="mr-4 text-gray-600">{icon}</div>
            <div className="flex-1">
                <p className="font-semibold text-gray-800">{text}</p>
                {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
            </div>
            {value && <p className="font-semibold text-gray-800">{value}</p>}
            {hasChevron && <ChevronRightIcon className="w-5 h-5 text-gray-400 ml-4" />}
        </div>
    );

    if (onClick) {
        return (
            <button onClick={onClick} className="w-full text-left transition-colors duration-200 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl">
               {content}
            </button>
        )
    }
    return <div className="first:rounded-t-xl last:rounded-b-xl">{content}</div>;
};

const QuickActionButton: React.FC<{icon: React.ReactNode, label: string, onClick: () => void}> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all duration-200">
        <div className="text-gray-700">{icon}</div>
        <span className="mt-2 font-semibold text-sm text-gray-800">{label}</span>
    </button>
);


export const Account: React.FC<AccountProps> = ({ onNavigate }) => {
    
    const comingSoon = () => onNavigate('request'); // Placeholder for now

    return (
        <div className="h-full overflow-y-auto bg-gray-50 pb-8">
            <header className="p-4 pt-6">
                <h1 className="text-4xl font-bold text-gray-900">Cuenta</h1>
            </header>

            <div className="px-4 mb-6">
                <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-bold mr-4">
                        CV
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-900">Caleb V.</p>
                        <button onClick={comingSoon} className="text-sm font-semibold text-orange-500 hover:text-orange-600">
                            Editar perfil ›
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 px-4 mb-8">
                <QuickActionButton icon={<PackageIcon className="w-7 h-7" />} label="Pedidos" onClick={comingSoon} />
                <QuickActionButton icon={<HeadphonesIcon className="w-7 h-7" />} label="Ayuda" onClick={() => onNavigate('support')} />
                <QuickActionButton icon={<CreditCardIcon className="w-7 h-7" />} label="Métodos de pago" onClick={comingSoon} />
            </div>
            
            <div className="px-4 space-y-8">
                <Section title="Amigos e Influencers">
                    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <ListItem icon={<UserIcon className="w-6 h-6" />} text="Mis amigos" subtext="Selecciona tus amigos y lo que pueden ver" onClick={comingSoon} />
                        <hr className="border-gray-100" />
                        <ListItem icon={<SparklesIcon className="w-6 h-6" />} text="Influencers" subtext="Sigue a los influencers y ve sus recomendaciones" onClick={comingSoon} />
                    </div>
                </Section>

                <Section title="Beneficios">
                    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <ListItem 
                            icon={<div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">CR</div>} 
                            text="Créditos" 
                            value="$0.00"
                            hasChevron={false}
                        />
                        <hr className="border-gray-100" />
                        <ListItem icon={<TicketIcon className="w-6 h-6" />} text="Cupones" onClick={comingSoon} />
                        <hr className="border-gray-100" />
                        <ListItem icon={<StarIcon className="w-6 h-6 text-yellow-500" />} text="Loyalty" onClick={comingSoon} />
                    </div>
                </Section>
                
                <Section title="Mi cuenta">
                    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <ListItem icon={<CrownIcon className="w-6 h-6" />} text="RappiPro" onClick={comingSoon} />
                         <hr className="border-gray-100" />
                        <ListItem icon={<LocationIcon className="w-6 h-6" />} text="Direcciones" onClick={() => onNavigate('addAddress')} />
                         <hr className="border-gray-100" />
                        <ListItem icon={<CreditCardIcon className="w-6 h-6" />} text="Métodos de pago" onClick={comingSoon} />
                         <hr className="border-gray-100" />
                        <ListItem icon={<DocumentTextIcon className="w-6 h-6" />} text="Datos de facturación" onClick={comingSoon} />
                         <hr className="border-gray-100" />
                        <ListItem icon={<HeadphonesIcon className="w-6 h-6" />} text="Ayuda" onClick={() => onNavigate('support')} />
                    </div>
                </Section>

                <Section title="Configuración">
                    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <ListItem icon={<BellIcon className="w-6 h-6" />} text="Notificaciones" onClick={comingSoon} />
                    </div>
                </Section>
                
                <Section title="Más información">
                    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <ListItem icon={<StoreIcon className="w-6 h-6" />} text="Quiero ser Aliado Estrella" onClick={comingSoon} />
                         <hr className="border-gray-100" />
                        <ListItem icon={<MotorcycleIcon className="w-6 h-6" />} text="Quiero ser Repartidor" onClick={comingSoon} />
                    </div>
                </Section>
            </div>
        </div>
    );
};