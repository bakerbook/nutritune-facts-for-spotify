import { useState, useEffect } from "react"

export default function Loading(){
    const [dots, setDots] = useState(".")

    useEffect(() => {
        const interval = setInterval(() => {
            switch(dots){
                case ".":
                    setDots("..")
                    break
                case "..":
                    setDots("...")
                    break
                default:
                    setDots(".")
            }
        }, 500)

        return () => clearInterval(interval)
    }, [dots])

    return(
        <h3>{"LOADING" + dots}</h3>
    )
}