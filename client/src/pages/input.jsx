/* eslint-disable react/prop-types */
"use client"

import { PlaceholdersAndVanishInput } from "../components/ui/placeholders-and-vanish-input"
import { fetchFoodData } from "../utils/fetchFoodData"

function PlaceholdersAndVanishInputDemo({ foodName, setFoodName, setOutput }) {
  const placeholders = [
    "You know the business and I know the chemistry",
    "Enter the food name!",
    "Searching for some protein?",
  ]

  const updateVal = async (e) => {
    console.log(e.target.value)
    setFoodName(e.target.value)
  }

  const onSubmit = async () => {
    const data = await fetchFoodData(foodName)
    // setOutput((prevData) =>
    //   [...prevData, data]);
    setOutput([data])
    console.log("submitted", data)
  }
  return (
    <div className="h-[20rem] sm:h-[30rem] md:h-[40rem] flex flex-col items-center px-4">
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onChange={updateVal}
        onSubmit={onSubmit}
        value={foodName}
      />
    </div>
  )
}
export default PlaceholdersAndVanishInputDemo

