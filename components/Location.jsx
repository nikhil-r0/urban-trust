import * as Location from "expo-location";

const useLocation =() => {
    const [errorMsg,setErrorMsg]=useState("");
    const [longitutde,setLongitutde]=useState("");
    const [latitude,setLatitude]=useState("");

    const getUserLocation =async () => {
        let {status} =await Location.requestForegroundPermissionsAsync();

        if(status !=="granted"){
            setErrorMsg("Permission to Location was not granted");
            return;
        }

        let {coords}=await Location.getCurrentPositionAsync();

        if(coords){
            const {latitude, longitutde} = coords;
            console,log("lat and long is",latitude, longitutde);
            setLatitude(latitude);
            setLongitutde(longitutde);
            let response =await Location.reverseGeocodeAsync({
                latitude,
                longitutde
            })

            console.log('USER LOCATION IS',response);
        }
    };

    return {latitude, longitutde,errorMsg};
};

export default useLocation;

const styles = StyleSheet.create({});