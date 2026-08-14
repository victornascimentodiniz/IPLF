import {
    adminAutenticado
} from "../lib/admin-auth.mjs";


export default async (req, context) => {

    return Response.json({

        autenticado:
            adminAutenticado(
                context
            )

    });

};


export const config = {

    path: "/api/admin/status"

};