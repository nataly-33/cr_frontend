import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, Lock } from "lucide-react";
import { settingsService } from "../services/settings.service";
import {
  Button,
  Input,
  Card,
  CardHeader,
} from "@shared/components/ui";
import { showToast } from "@shared/utils";

const passwordSchema = z.object({
  current_password: z.string().min(1, "La contraseña actual es requerida"),
  new_password: z
    .string()
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
  confirm_password: z.string().min(1, "Confirma la nueva contraseña"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Las contraseñas no coinciden",
  path: ["confirm_password"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export const SecurityPage = () => {
  const [changingPassword, setChangingPassword] = useState(false);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setChangingPassword(true);
      await settingsService.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
        new_password_confirmation: data.confirm_password,
      });
      showToast.success("Contraseña cambiada exitosamente");
      resetPassword();
    } catch (error: any) {
      console.error("Error changing password:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al cambiar la contraseña";
      showToast.error(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <div className="p-6">
          <CardHeader
            title="Cambiar Contraseña"
            subtitle="Actualiza tu contraseña regularmente para mantener tu cuenta segura"
          />

          <form
            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
            className="space-y-4 mt-6"
          >
            <Input
              label="Contraseña Actual *"
              type="password"
              {...registerPassword("current_password")}
              error={passwordErrors.current_password?.message}
              placeholder="••••••••"
            />

            <Input
              label="Nueva Contraseña *"
              type="password"
              {...registerPassword("new_password")}
              error={passwordErrors.new_password?.message}
              placeholder="••••••••"
              helperText="Debe tener al menos 8 caracteres"
            />

            <Input
              label="Confirmar Nueva Contraseña *"
              type="password"
              {...registerPassword("confirm_password")}
              error={passwordErrors.confirm_password?.message}
              placeholder="••••••••"
            />

            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                leftIcon={<Lock className="h-4 w-4" />}
                disabled={changingPassword}
                isLoading={changingPassword}
              >
                Cambiar Contraseña
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Security Info */}
      <Card>
        <div className="p-6">
          <CardHeader
            title="Consejos de Seguridad"
            subtitle="Mantén tu cuenta protegida"
          />

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Usa una contraseña fuerte
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Combina letras mayúsculas, minúsculas, números y símbolos para crear
                  una contraseña segura.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  No compartas tu contraseña
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Nunca compartas tu contraseña con nadie, ni siquiera con personal de
                  soporte.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Cambia tu contraseña regularmente
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Se recomienda cambiar tu contraseña cada 3-6 meses para mantener tu
                  cuenta segura.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Cierra sesión al terminar
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Siempre cierra tu sesión cuando uses dispositivos compartidos o
                  públicos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
