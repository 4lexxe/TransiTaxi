import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button, Heading, Input } from "../components";
import axios from "axios";
import Console from "../utils/console";
import { BASE_URL } from "../config";

function UserSignup() {
  const [responseError, setResponseError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const navigation = useNavigate();

  const getErrorMessage = (error) => {
    const responseData = error?.response?.data;

    if (Array.isArray(responseData) && responseData[0]?.msg) {
      return responseData[0].msg;
    }

    if (Array.isArray(responseData?.errors) && responseData.errors[0]?.msg) {
      return responseData.errors[0].msg;
    }

    if (responseData?.message) {
      return responseData.message;
    }

    return "No se pudo completar el registro";
  };

  const signupUser = async (data) => {
    const userData = {
      fullname: {
        firstname: data.firstname,
        lastname: data.lastname,
      },
      email: data.email,
      password: data.password,
      phone: data.phone
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${BASE_URL}/user/register`,
        userData
      );
      Console.log(response);
      localStorage.setItem("token", response.data.token);
      navigation("/home");
    } catch (error) {
      setResponseError(getErrorMessage(error));
      Console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setResponseError("");
    }, 5000);
  }, [responseError]);
  return (
    <div className="w-full h-dvh flex flex-col justify-between p-4 pt-6">
      <div>
        <Heading title={"Registrarse 👤"} />
        <form onSubmit={handleSubmit(signupUser)}>
          <div className="flex gap-4 -mb-2">
            <Input
              label={"Nombre"}
              name={"firstname"}
              register={register}
              error={errors.firstname}
            />
            <Input
              label={"Apellido"}
              name={"lastname"}
              register={register}
              error={errors.lastname}
            />
          </div>
          <Input
            label={"Número de teléfono"}
            type={"number"}
            name={"phone"}
            register={register}
            error={errors.phone}
          />
          <Input
            label={"Correo"}
            type={"email"}
            name={"email"}
            register={register}
            error={errors.email}
          />
          <Input
            label={"Contraseña"}
            type={"password"}
            name={"password"}
            register={register}
            error={errors.password}
          />
          {responseError && (
            <p className="text-sm text-center mb-4 text-red-500">
              {responseError}
            </p>
          )}
          <Button title={"Registrarse"} loading={loading} type="submit" />
        </form>
        <p className="text-sm font-normal text-center mt-4">
          ¿Ya tiene cuenta?{" "}
          <Link to={"/login"} className="font-semibold">
            Iniciar sesión
          </Link>
        </p>
      </div>
      <div>
        <Button
          type={"link"}
          path={"/captain/signup"}
          title={"Registrarse como conductor"}
          classes={"bg-orange-500"}
        />
        <p className="text-xs font-normal text-center self-end mt-6">
          La búsqueda de ubicación utiliza datos de OpenStreetMap y servicios de enrutamiento.
        </p>
      </div>
    </div>
  );
}

export default UserSignup;
