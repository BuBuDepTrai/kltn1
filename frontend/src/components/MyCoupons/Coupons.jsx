import { useSelector } from 'react-redux';
import MetaData from '../Layouts/MetaData';
import MinCategory from '../Layouts/MinCategory';
import Sidebar from '../User/Sidebar';
import Coupon from './Coupon';  // Assume this is a component similar to Product but for coupons

const MyCoupons = () => {
    const { couponItems } = useSelector((state) => state.coupons);

    return (
        <>
            <MetaData title="My Coupons | Flipkart" />

            <MinCategory />
            <main className="w-full mt-12 sm:mt-0">

                <div className="flex gap-3.5 sm:w-11/12 sm:mt-4 m-auto mb-7">

                    <Sidebar activeTab={"coupons"} />

                    <div className="flex-1 shadow bg-white">
                        <div className="flex flex-col">
                            <span className="font-medium text-lg px-4 sm:px-8 py-4 border-b">My Coupons ({couponItems.length})</span>

                            {couponItems.length === 0 && (
                                <div className="flex items-center flex-col gap-2 m-6">
                                    <img draggable="false" className="object-contain" src="https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/coupon-empty.png" alt="Empty Coupons" />
                                    <span className="text-lg font-medium mt-6">Empty Coupons</span>
                                    <p>You have no coupons at the moment. Start saving!</p>
                                </div>
                            )}

                            {couponItems.map((item, index) => (
                                <Coupon {...item} key={index} />
                            )).reverse()}

                        </div>
                    </div>

                </div>
            </main>
        </>
    );
};

export default MyCoupons;
