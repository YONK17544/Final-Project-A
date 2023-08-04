import { useSelector } from 'react-redux';

export const GetYourData = () => {
    const data = useSelector((state) => state.auth);
    return data;
}
