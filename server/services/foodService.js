const handleSearch = async () => {
    try {
      const response = await axios.post('http://localhost:3000/analyze', { foodName });
      setFoodData(response.data);
    } catch (error) {
      console.error('Error fetching food data:', error);
    }
  };