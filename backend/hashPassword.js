import bcrypt from "bcryptjs"

async function generateHashedPassword(senha) {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(senha, salt)
    } catch (error) {
        console.error('Erro ao hashear a senha:', error)
    }
}

export default generateHashedPassword;