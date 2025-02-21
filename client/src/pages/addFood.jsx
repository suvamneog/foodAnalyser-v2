import { useState, useEffect } from 'react';
import { ScrollArea } from '../components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Utensils, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ShootingStars } from "../components/ui/shooting-stars";
import { StarsBackground } from "../components/ui/stars-background";
import { motion } from "framer-motion";

function AddFood() {
  const [foodHistory, setFoodHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const emptyFood = {
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    pros: '',
    cons: ''
  };
  
  const [newFood, setNewFood] = useState(emptyFood);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false); // Track request state

  

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/food', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch foods');
      }
      
      const data = await response.json();
      setFoodHistory(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching foods:', err);
    } finally {  
      setIsLoading(false);
    }
  };

  const handleAddOrUpdateFood = async () => {
    if (isRequesting) return; // Prevent multiple requests
    setIsRequesting(true);
  
    try {
      if (!newFood.name || !newFood.calories) {
        throw new Error('Name and calories are required');
      }
  
      const prosArray = newFood.pros.split(',').map(pro => pro.trim()).filter(Boolean);
      const consArray = newFood.cons.split(',').map(con => con.trim()).filter(Boolean);
  
      const foodData = {
        ...newFood,
        calories: Number(newFood.calories),
        protein: Number(newFood.protein) || 0,
        carbs: Number(newFood.carbs) || 0,
        fats: Number(newFood.fats) || 0,
        pros: prosArray,
        cons: consArray
      };
  
      const url = isEditing 
        ? `http://localhost:3000/api/food/${editingId}` 
        : 'http://localhost:3000/api/food';
  
      const method = isEditing ? 'PUT' : 'POST';
  
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(foodData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save food');
      }
  
      await fetchFoods();
      setNewFood(emptyFood);
      setIsEditing(false);
      setEditingId(null);
      setIsDialogOpen(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error saving food:', err);
    } finally {
      setIsRequesting(false); // Allow new requests
    }
  };
  
  const handleEdit = (food) => {
    setIsEditing(true);
    setEditingId(food._id);
    setNewFood({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      pros: food.pros.join(', '),
      cons: food.cons.join(', ')
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (isRequesting) return; // Prevent multiple requests
    setIsRequesting(true);
  
    try {
      const response = await fetch(`http://localhost:3000/api/food/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete food');
      }
  
      await fetchFoods();
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error deleting food:', err);
    } finally {
      setIsRequesting(false); // Allow new requests
    }
  };
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setNewFood(emptyFood);
    setIsEditing(false);
    setEditingId(null);
    setError(null);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="relative bg-black min-h-screen p-6 mt-14">
      <div className="absolute inset-0 pointer-events-none">
        <StarsBackground />
        <ShootingStars />
      </div>
      {error && (
        <div className="max-w-4xl mx-auto mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={() => {
                  setNewFood(emptyFood);
                  setIsEditing(false);
                  setEditingId(null);
                }}>
                  <Plus size={16} />
                  Add Food
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{isEditing ? 'Edit Food' : 'Add New Food'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Food Name</Label>
                    <Input
                      id="name"
                      value={newFood.name}
                      onChange={(e) => setNewFood(prev => ({ ...prev, name: e.target.value }))}
                      className="text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="calories">Calories</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={newFood.calories}
                        onChange={(e) => setNewFood(prev => ({ ...prev, calories: e.target.value }))}
                        className="text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        value={newFood.protein}
                        onChange={(e) => setNewFood(prev => ({ ...prev, protein: e.target.value }))}
                        className="text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        value={newFood.carbs}
                        onChange={(e) => setNewFood(prev => ({ ...prev, carbs: e.target.value }))}
                        className="text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fats">Fats (g)</Label>
                      <Input
                        id="fats"
                        type="number"
                        value={newFood.fats}
                        onChange={(e) => setNewFood(prev => ({ ...prev, fats: e.target.value }))}
                        className="text-white"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pros">Pros (comma-separated)</Label>
                    <Textarea
                      id="pros"
                      value={newFood.pros}
                      onChange={(e) => setNewFood(prev => ({ ...prev, pros: e.target.value }))}
                      placeholder="High protein, Low fat, etc."
                      className="text-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cons">Cons (comma-separated)</Label>
                    <Textarea
                      id="cons"
                      value={newFood.cons}
                      onChange={(e) => setNewFood(prev => ({ ...prev, cons: e.target.value }))}
                      placeholder="High in sodium, Contains allergens, etc."
                      className="text-white"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={handleDialogClose}
                      className="text-white border-white hover:bg-white hover:text-black transition"
                    >Cancel</Button>
                    <Button onClick={handleAddOrUpdateFood}>
                      {isEditing ? 'Update Food' : 'Add Food'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <ScrollArea className="h-[800px] rounded-lg border">
            {foodHistory.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No foods added yet. Click the Add Food button to get started!
              </div>
            ) : (
              foodHistory.map((food) => (
                <Card key={food._id} className="mb-4 mx-4 mt-4 hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-primary" />
                      {food.name}
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(food.date).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                        onClick={() => handleEdit(food)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => handleDelete(food._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="bg-secondary/50 p-3 rounded-lg">
                        <div className="text-sm font-medium">Calories</div>
                        <div className="text-2xl font-bold">{food.calories}</div>
                      </div>
                      <div className="bg-secondary/50 p-3 rounded-lg">
                        <div className="text-sm font-medium">Protein</div>
                        <div className="text-2xl font-bold">{food.protein}g</div>
                      </div>
                      <div className="bg-secondary/50 p-3 rounded-lg">
                        <div className="text-sm font-medium">Carbs</div>
                        <div className="text-2xl font-bold">{food.carbs}g</div>
                      </div>
                      <div className="bg-secondary/50 p-3 rounded-lg">
                        <div className="text-sm font-medium">Fats</div>
                        <div className="text-2xl font-bold">{food.fats}g</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm font-medium mb-1">Pros</div>
                        <div className="flex flex-wrap gap-2">
                          {food.pros.map((pro, index) => (
                            <Badge key={index} variant="secondary" className="bg-green-500/10 text-green-700 hover:bg-green-500/20">
                              {pro}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1">Cons</div>
                        <div className="flex flex-wrap gap-2">
                          {food.cons.map((con, index) => (
                            <Badge key={index} variant="secondary" className="bg-red-500/10 text-red-700 hover:bg-red-500/20">
                              {con}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </ScrollArea>
        </div>
      </motion.div>
    </div>
  );
}

export default AddFood;