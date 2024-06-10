import tivi from '../../assets/images/Categories/tivi.jpg';
import dt from '../../assets/images/Categories/dt.jpg';
import laptops from '../../assets/images/Categories/laptap.jpg';
import dongho from '../../assets/images/Categories/dh.jpg';
import amthanh from '../../assets/images/Categories/amthanh.jpg';
import Smarthome from '../../assets/images/Categories/smarthome.jpg';
import Camera from '../../assets/images/Categories/camera.jpg';
import Tablet from '../../assets/images/Categories/tablet.jpg';
import { Link } from 'react-router-dom';

const catNav = [
    {
        name: "Tivi",
        icon: tivi,
    },
    {
        name: "Điện thoại",
        icon: dt,
    },
    {
        name: "Laptops",
        icon: laptops,
    },
    {
        name: "Đồng hồ",
        icon: dongho,
    },
    {
        name: "Âm thanh",
        icon: amthanh,
    },
    {
        name: "Gia dụng, Smarthome",
        icon: Smarthome,
    },
    {
        name: "Camera",
        icon: Camera,
    },
    {
        name: "Tablet",
        icon: Tablet,
    },
]

const Categories = () => {
    return (
        <section className="hidden sm:block bg-white mt-10 mb-4 min-w-full px-12 py-1 shadow overflow-hidden">

            <div className="flex items-center justify-between mt-4">

                {catNav.map((item, i) => (
                    <Link to={`/products?category=${item.name}`} className="flex flex-col gap-1 items-center p-2 group" key={i}>
                        <div className="h-16 w-16">
                            <img draggable="false" className="h-full w-full object-contain" src={item.icon} alt={item.name} />
                        </div>
                        <span className="text-sm text-gray-800 font-medium group-hover:text-primary-blue">{item.name}</span>
                    </Link>
                ))}

            </div>
        </section>
    );
};

export default Categories;
