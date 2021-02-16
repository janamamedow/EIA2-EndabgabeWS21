namespace feuerwerk {
  // rocket model für database 
  export interface RocketObject {
    name: string,
    color: number,
    secondColor: number,
    speed: number,
    size: number,
    _id?: string
  }

}