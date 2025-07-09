import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import HomeScreen from '../screens/HomeScreen';
import BuscarPetScreen from '../screens/BuscarPetScreen';
import CadastrarPetScreen from '../screens/CadastrarPetScreen';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: 'Cadastro' }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'AchaMeuPet' }} />
      <Stack.Screen name="BuscarPet" component={BuscarPetScreen} options={{ title: 'Buscar Pets Perdidos' }} />
      <Stack.Screen name="CadastrarPet" component={CadastrarPetScreen} options={{ title: 'Cadastrar Pet Perdido' }} />
    </Stack.Navigator>
  );
}
