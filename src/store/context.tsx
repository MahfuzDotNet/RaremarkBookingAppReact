import React, { Component } from 'react';
import { IStateContext, RoomsObject } from '../models/models';



const RoomContext = React.createContext<RoomsObject | null>(null);

class RoomProvider extends Component<{}, IStateContext> {

    public readonly state: Readonly<IStateContext> = {
        rooms: [],
        sortedRooms: [],
        featuredRooms: [],
        loading: true,
        type: "all",
        capacity: 1,
        price: 0,
        minPrice: 0,
        maxPrice: 0,
        minSize: 0,
        maxSize: 0,
        breakfast: false,
        pets: false
    }

    // Get Data when component mount
    public componentDidMount() {

        const fetchData = async () => {
            const result = await fetch(`http://localhost:8000/api/rooms`);
            const body = await result.json();
            //console.log("body[].image::" + JSON.stringify(body));

            console.log("result:: " + JSON.parse(body)[0].price);  
            const item =  JSON.parse(body);         
            let rooms = this.formatData(item);
            console.log("");
            let featuredRooms = rooms.filter((room: any) => room.featured === true);
            let maxPrice = Math.max(...rooms.map((item: any) => item.price));
            let maxSize = Math.max(...rooms.map((item: any) => item.size));
    
            this.setState({
                rooms,
                featuredRooms,
                sortedRooms: rooms,
                loading: false,
                price: maxPrice,
                maxPrice,
                maxSize
            })
            
        }
        fetchData();      

    }

    public render() {
        return (
            <RoomContext.Provider value={{...this.state, getRoom: this.getRoom, handleChange: this.handleChange, handleChecked: this.handleChecked}}>
                {this.props.children}
            </RoomContext.Provider>
        )
    }

    private formatData = (items: any) => {
        let id = 0;
        const tempItems = items.map((item: any) => {          
            id = id+1
            //let image = item.image
            //let images = item.image
            //let images = JSON.parse(JSON.stringify(item.images))
      
            let images = item.images.map((image: any) => image.fields.file.url)
            console.log("item.images" + images);
            const room = {...item, images, id} // Reformating the array
            return room;
        })

        return tempItems;
    }

    private getRoom = (slug: string) => {
        const tempRooms = [...this.state.rooms];
        const room = tempRooms.find((room: any) => room.slug === slug);
        return room;
    }

    private handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = event.target.value;
        const name = event.target.name;

        const obj: any = {};
        obj[name] = value;

        this.setState(obj, this.filterRooms);
    }

    private handleChecked = (event: any) => {
        console.log("pets", this.state.pets);
        console.log("breakfast", this.state.breakfast);
        const value = event.target.checked;
        const name = event.target.name;

        const obj: any = {};
        obj[name] = value;

        this.setState(obj, this.filterRooms);
    }

    private filterRooms = () => {
        let { rooms, type, capacity, price, minSize, maxSize, breakfast, pets } = this.state;
        // all the rooms
        let tempRooms = [...rooms];
        // transform value
        capacity = Number(capacity);
        price = Number(price);

        // filter by type
        if (type !== 'all') {
            tempRooms = tempRooms.filter(room => room.type === type)
        }

        // filter by capacity
        if (capacity !== 1) {
            tempRooms = tempRooms.filter(room => room.capacity >= capacity)
        }

        // filter by price
        tempRooms = tempRooms.filter(room => room.price <= price)

        // filter by size
        tempRooms = tempRooms.filter(room => room.size >= minSize && room.size <= maxSize);

        // filter by breakfast
        if (breakfast) {
            tempRooms = tempRooms.filter(room => room.breakfast === true);
        }

        // filter by pets
        if (pets) {
            tempRooms = tempRooms.filter(room => room.pets === true);
        }

        // change state
        this.setState({
            sortedRooms: tempRooms
        })
    }
}

const RoomConsumer = RoomContext.Consumer;

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// For Using Context with Functional Component (Stateless) with HOC
export const withRoomConsumer = <P extends {}>(Component: React.ComponentClass<P> | React.StatelessComponent<P>): React.FC<any> => props => {
    return <RoomConsumer>
            { value => <Component {...props} context={value} />}
        </RoomConsumer>;
};

// Exporting all contexts
export {RoomProvider, RoomConsumer, RoomContext};

