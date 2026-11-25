require("./loadEnv");
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const conexao = require("./db.js");
const chatbotRoutes = require("./chatback/routes/chatbot");

const app = express();
const SECRET = process.env.JWT_SECRET || "segredo_super_secreto";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_FORTE_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;
const YOUTUBE_REGEX =
    /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[A-Za-z0-9_-]{11}([?&].*)?$/;

const MIME_EXTENSAO = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif"
};

app.use(express.json());
app.use(cors());

const pastaFotos = path.join(__dirname, "uploads/fotos");
fs.mkdirSync(pastaFotos, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, pastaFotos),
    filename: (req, file, cb) => {
        const ext =
            MIME_EXTENSAO[file.mimetype] ||
            path.extname(file.originalname).toLowerCase() ||
            ".jpg";
        cb(null, `user_${req.usuario.id}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (MIME_EXTENSAO[file.mimetype]) {
            cb(null, true);
        } else {
            cb(new Error("Formato de imagem inválido. Use JPG, PNG, WEBP ou GIF."));
        }
    }
});

function uploadFotoMiddleware(req, res, next) {
    upload.single("foto")(req, res, (err) => {
        if (!err) return next();
        if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ resposta: "A imagem deve ter no máximo 5 MB." });
        }
        return res.status(400).json({ resposta: err.message || "Erro ao processar imagem." });
    });
}

function normalizarTelefone(valor) {
    let digitos = String(valor || "").replace(/\D/g, "");
    if (digitos.startsWith("55") && digitos.length > 11) {
        digitos = digitos.slice(2);
    }
    return digitos;
}

function verificarToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({ erro: "Token não fornecido" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ erro: "Token não fornecido" });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        req.usuario = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ erro: "Token inválido" });
    }
}

function exigirAdmin(req, res, next) {
    if (req.usuario?.nivel !== "A") {
        return res.status(403).json({ resposta: "Acesso negado", message: "Acesso negado." });
    }
    next();
}

app.get("/health", (req, res) => {
    res.json({ status: "ok", plataforma: "StarDev" });
});

app.post("/contato", async (req, res) => {
    try {
        const nome = String(req.body?.nome || "").trim();
        const email = String(req.body?.email || "").trim();
        const comentario = String(req.body?.comentario || "").trim();

        if (nome.length < 6) {
            return res.json({ resposta: "Preencha o nome completo" });
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.json({ resposta: "Preencha o email corretamente" });
        }
        if (comentario.length < 10) {
            return res.json({ resposta: "Preencha o comentário corretamente" });
        }

        const sql = "INSERT INTO contato (nome, email, comentario) VALUES (?,?,?)";
        const [resu] = await conexao.query(sql, [nome, email, comentario]);
        if (resu.affectedRows === 1) {
            return res.json({ resposta: "Mensagem enviada com sucesso" });
        }
        return res.json({ resposta: "Erro ao enviar mensagem" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});

app.post("/cadastro", async (req, res) => {
    try {
        const nome = String(req.body?.nome || "").trim();
        const email = String(req.body?.email || "").trim();
        const senhaTrim = String(req.body?.senha || "").trim().replace(/\u3164/g, "");
        const telefoneLimpo = normalizarTelefone(req.body?.telefone);

        if (nome.length < 6) {
            return res.json({ resposta: "Preencha corretamente o seu nome completo" });
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.json({ resposta: "Preencha o email corretamente" });
        }
        if (!/^\d{10,11}$/.test(telefoneLimpo)) {
            return res.json({
                resposta: "Digite um telefone válido contendo apenas números (DDD + número)."
            });
        }
        if (senhaTrim === "") {
            return res.json({ resposta: "Preencha uma senha" });
        }
        if (!SENHA_FORTE_REGEX.test(senhaTrim)) {
            return res.json({
                resposta:
                    "A senha deve possuir no mínimo 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial."
            });
        }

        const [rows] = await conexao.query(
            "SELECT id_cadastro FROM cadastro WHERE LOWER(email) = LOWER(?)",
            [email]
        );
        if (rows.length !== 0) {
            return res.json({ resposta: "Email já cadastrado" });
        }

        const hash = await bcrypt.hash(senhaTrim, 10);
        const sqlInsert = `
            INSERT INTO cadastro (nome, email, senha, telefone)
            VALUES (?,?,?,?)
        `;
        const [resul] = await conexao.query(sqlInsert, [nome, email, hash, telefoneLimpo]);
        if (resul.affectedRows === 1) {
            return res.json({ resposta: "Cadastro feito com sucesso!" });
        }
        return res.json({ resposta: "Erro ao cadastrar usuário" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const emailTrim = String(req.body?.email || "").trim();
        const senhaTrim = String(req.body?.senha || "").trim();

        if (!emailTrim || !senhaTrim) {
            return res.json({ resposta: "Preencha email e senha." });
        }
        if (!EMAIL_REGEX.test(emailTrim)) {
            return res.json({ resposta: "Digite um email válido." });
        }

        const [resultado] = await conexao.query(
            "SELECT * FROM cadastro WHERE LOWER(email) = LOWER(?)",
            [emailTrim]
        );
        if (resultado.length === 0) {
            return res.json({ resposta: "Email não cadastrado" });
        }

        const usuario = resultado[0];
        const senhaValida = await bcrypt.compare(senhaTrim, usuario.senha);
        if (!senhaValida) {
            return res.json({ resposta: "Email ou senha incorretos" });
        }

        const token = jwt.sign(
            {
                id: usuario.id_cadastro,
                email: usuario.email,
                nivel: usuario.nivel
            },
            SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.json({
            mensagem: "Acesso liberado",
            token,
            nivel: usuario.nivel
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});

app.get("/usuario", verificarToken, async (req, res) => {
    try {
        const userId = req.usuario.id;
        const [rows] = await conexao.query(
            "SELECT nome, email, telefone, bio, foto, nivel FROM cadastro WHERE id_cadastro=?",
            [userId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ resposta: "Usuário não encontrado" });
        }
        return res.json(rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/usuario/foto", verificarToken, uploadFotoMiddleware, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ resposta: "Nenhuma imagem enviada." });
        }

        const userId = req.usuario.id;
        const caminho = `/uploads/fotos/${req.file.filename}`;

        const [rows] = await conexao.query(
            "SELECT foto FROM cadastro WHERE id_cadastro=?",
            [userId]
        );
        const fotoAnterior = rows[0]?.foto;
        if (fotoAnterior && fotoAnterior !== caminho) {
            const caminhoAnterior = path.join(__dirname, fotoAnterior);
            fs.unlink(caminhoAnterior, () => {});
        }

        await conexao.query("UPDATE cadastro SET foto=? WHERE id_cadastro=?", [caminho, userId]);
        return res.json({ resposta: "Foto atualizada com sucesso", foto: caminho });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro ao salvar foto" });
    }
});

app.delete("/usuario/foto", verificarToken, async (req, res) => {
    try {
        const userId = req.usuario.id;
        const [rows] = await conexao.query(
            "SELECT foto FROM cadastro WHERE id_cadastro=?",
            [userId]
        );

        const fotoAtual = rows[0]?.foto;
        if (fotoAtual) {
            const caminhoAbsoluto = path.join(__dirname, fotoAtual);
            fs.unlink(caminhoAbsoluto, (err) => {
                if (err) console.log("Não foi possível apagar arquivo antigo:", err.message);
            });
        }

        await conexao.query("UPDATE cadastro SET foto=NULL WHERE id_cadastro=?", [userId]);
        return res.json({ resposta: "Foto removida com sucesso" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro ao remover foto" });
    }
});

app.put("/usuario", verificarToken, async (req, res) => {
    try {
        const nome = String(req.body?.nome || "").trim();
        const email = String(req.body?.email || "").trim();
        const telefone = normalizarTelefone(req.body?.telefone);
        const bio = String(req.body?.bio || "").trim();
        const userId = req.usuario.id;

        if (nome.length < 6) {
            return res.json({ resposta: "Preencha o nome completo" });
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.json({ resposta: "Digite um email válido" });
        }
        if (!/^\d{10,11}$/.test(telefone)) {
            return res.json({ resposta: "Digite um telefone válido" });
        }

        const [dup] = await conexao.query(
            "SELECT id_cadastro FROM cadastro WHERE LOWER(email)=LOWER(?) AND id_cadastro<>?",
            [email, userId]
        );
        if (dup.length) {
            return res.json({ resposta: "Email já cadastrado" });
        }

        const [result] = await conexao.query(
            "UPDATE cadastro SET nome=?, email=?, telefone=?, bio=? WHERE id_cadastro=?",
            [nome, email, telefone, bio, userId]
        );
        return res.json({
            resposta: result.affectedRows === 1 ? "Usuário atualizado com sucesso" : "Erro ao atualizar usuário"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});

app.put("/trocarSenha", verificarToken, async (req, res) => {
    try {
        const novaSenha = String(req.body?.novaSenha || "").trim();
        const userId = req.usuario.id;
        if (novaSenha.length < 6) {
            return res.json({ resposta: "Nova senha muito curta" });
        }
        const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
        const [update] = await conexao.query(
            "UPDATE cadastro SET senha=? WHERE id_cadastro=?",
            [novaSenhaHash, userId]
        );
        if (update.affectedRows === 1) {
            return res.json({ resposta: "Senha alterada com sucesso" });
        }
        return res.json({ resposta: "Erro ao atualizar senha" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});

app.post("/verificarEmail", async (req, res) => {
    try {
        const email = String(req.body?.email || "").trim();
        if (!email) {
            return res.json({ existe: false });
        }
        const [resultado] = await conexao.query(
            "SELECT id_cadastro FROM cadastro WHERE LOWER(email)=LOWER(?)",
            [email]
        );
        return res.json({ existe: resultado.length > 0 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});

app.put("/recuperarSenha", async (req, res) => {
    try {
        const email = String(req.body?.email || "").trim();
        const novaSenha = String(req.body?.novaSenha || "").trim();

        if (!EMAIL_REGEX.test(email)) {
            return res.json({ resposta: "Email inválido" });
        }
        if (novaSenha.length < 6) {
            return res.json({ resposta: "Senha inválida (mínimo 6 caracteres)" });
        }

        const [user] = await conexao.query(
            "SELECT id_cadastro FROM cadastro WHERE LOWER(email)=LOWER(?)",
            [email]
        );
        if (user.length === 0) {
            return res.json({ resposta: "Email não encontrado" });
        }

        const hash = await bcrypt.hash(novaSenha, 10);
        await conexao.query(
            "UPDATE cadastro SET senha=? WHERE id_cadastro=?",
            [hash, user[0].id_cadastro]
        );
        return res.json({ resposta: "Senha redefinida com sucesso" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});

/* DISCIPLINAS (AULAS) */
app.get("/aulas", verificarToken, async (req, res) => {
    try {
        const [dados] = await conexao.query("SELECT * FROM aulas ORDER BY id_aula ASC");
        res.json(dados);
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro ao buscar disciplinas" });
    }
});

app.post("/CadastroAulas", verificarToken, exigirAdmin, async (req, res) => {
    try {
        const materia = String(req.body?.materia || "").trim();
        const duracao = String(req.body?.duracao || "").trim() || "-";
        const qtd_aulas = Math.max(0, Number.parseInt(req.body?.qtd_aulas, 10) || 0);

        if (materia.length < 2) {
            return res.status(400).json({ resposta: "Informe o nome da disciplina." });
        }

        const [result] = await conexao.query(
            "INSERT INTO aulas (materia, duracao, qtd_aulas) VALUES (?,?,?)",
            [materia, duracao, qtd_aulas]
        );
        if (result.affectedRows === 1) {
            return res.json({
                resposta: "Aulas cadastradas com sucesso",
                message: "Disciplina cadastrada com sucesso.",
                id: result.insertId
            });
        }
        return res.status(500).json({ resposta: "Erro ao cadastrar aulas" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});

app.put("/aulas/:id", verificarToken, exigirAdmin, async (req, res) => {
    try {
        const materia = String(req.body?.materia || "").trim();
        const duracao = String(req.body?.duracao || "").trim() || "-";
        const qtd_aulas = Math.max(0, Number.parseInt(req.body?.qtd_aulas, 10) || 0);

        if (materia.length < 2) {
            return res.status(400).json({ message: "Informe o nome da disciplina." });
        }

        const [r] = await conexao.query(
            "UPDATE aulas SET materia = ?, duracao = ?, qtd_aulas = ? WHERE id_aula = ?",
            [materia, duracao, qtd_aulas, req.params.id]
        );
        if (r.affectedRows === 0) {
            return res.status(404).json({ message: "Disciplina não encontrada." });
        }
        res.json({
            message: "Disciplina atualizada com sucesso.",
            resposta: "Disciplina atualizada com sucesso."
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erro ao atualizar a disciplina." });
    }
});

app.delete("/aulas/:id", verificarToken, exigirAdmin, async (req, res) => {
    try {
        const [vinculadas] = await conexao.query(
            "SELECT COUNT(*) AS total FROM materias WHERE id_aula = ?",
            [req.params.id]
        );
        if (vinculadas[0]?.total > 0) {
            return res.status(409).json({
                message: "Não foi possível excluir: existem videoaulas vinculadas a esta disciplina."
            });
        }

        const [r] = await conexao.query("DELETE FROM aulas WHERE id_aula = ?", [req.params.id]);
        if (r.affectedRows === 0) {
            return res.status(404).json({ message: "Disciplina não encontrada." });
        }
        res.json({
            message: "Disciplina removida com sucesso.",
            resposta: "Disciplina removida com sucesso."
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Não foi possível excluir. Verifique se há videoaulas vinculadas."
        });
    }
});

/* FEEDBACKS */
app.get("/feedbacks", verificarToken, exigirAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT *
            FROM contato
            ORDER BY id_contato DESC
        `;
        const [dados] = await conexao.query(sql);
        res.json(dados);
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro ao buscar feedbacks" });
    }
});

app.put("/feedbacks/:id", verificarToken, exigirAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const { nome, email, comentario, status_feedback } = req.body || {};

        if (status_feedback && nome === undefined && email === undefined && comentario === undefined) {
            const statusPermitidos = ["Pendente", "Respondido"];
            const statusFinal = statusPermitidos.includes(status_feedback) ? status_feedback : "Pendente";
            const [resultado] = await conexao.query(
                "UPDATE contato SET status_feedback=? WHERE id_contato=?",
                [statusFinal, id]
            );
            if (resultado.affectedRows === 1) {
                return res.json({ resposta: "Status do feedback atualizado com sucesso" });
            }
            return res.status(404).json({ resposta: "Feedback não encontrado" });
        }

        const [resultado] = await conexao.query(
            "UPDATE contato SET nome=?, email=?, comentario=?, status_feedback=COALESCE(?, status_feedback) WHERE id_contato=?",
            [nome, email, comentario, status_feedback || null, id]
        );
        if (resultado.affectedRows === 1) {
            return res.json({ resposta: "Feedback atualizado com sucesso" });
        }
        return res.status(404).json({ resposta: "Feedback não encontrado" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro ao atualizar feedback" });
    }
});

app.delete("/feedbacks/:id", verificarToken, exigirAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const [resultado] = await conexao.query("DELETE FROM contato WHERE id_contato=?", [id]);
        if (resultado.affectedRows === 1) {
            return res.json({ resposta: "Feedback removido com sucesso" });
        }
        return res.status(404).json({ resposta: "Feedback não encontrado" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro ao excluir feedback" });
    }
});

/* VIDEOAULAS */
app.get("/videoaulas", async (req, res) => {
    try {
        const [rows] = await conexao.query(`
            SELECT
                materias.id_materias,
                materias.nome_aulas,
                materias.descricao,
                materias.link,
                materias.id_aula,
                aulas.materia
            FROM materias
            LEFT JOIN aulas
            ON materias.id_aula = aulas.id_aula
            ORDER BY materias.id_materias DESC
        `);
        res.json(rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

function validarDadosVideoaula(body) {
    const nome = String(body?.nome_aulas || "").trim();
    const desc = String(body?.descricao || "").trim();
    const url = String(body?.link || "").trim();
    const id_aula = Number(body?.id_aula);

    if (!nome || !desc || !url || !id_aula) {
        return { erro: "Preencha todos os campos." };
    }
    if (nome.length < 5) {
        return { erro: "O nome da aula deve possuir pelo menos 5 caracteres." };
    }
    if (desc.length < 15) {
        return { erro: "A descrição deve possuir pelo menos 15 caracteres." };
    }
    if (!YOUTUBE_REGEX.test(url)) {
        return { erro: "Informe um link válido do YouTube." };
    }

    return { nome, desc, url, id_aula };
}

app.post("/videoaulas", verificarToken, exigirAdmin, async (req, res) => {
    try {
        const dados = validarDadosVideoaula(req.body);
        if (dados.erro) {
            return res.status(400).json({ message: dados.erro });
        }

        const [aulaExiste] = await conexao.query(
            "SELECT id_aula FROM aulas WHERE id_aula = ?",
            [dados.id_aula]
        );
        if (aulaExiste.length === 0) {
            return res.status(400).json({ message: "ID da aula não existe." });
        }

        const [result] = await conexao.query(
            "INSERT INTO materias (nome_aulas, descricao, link, id_aula) VALUES (?, ?, ?, ?)",
            [dados.nome, dados.desc, dados.url, dados.id_aula]
        );

        return res.status(201).json({
            message: "Videoaula cadastrada com sucesso.",
            id: result.insertId
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

app.put("/videoaulas/:id", verificarToken, exigirAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const dados = validarDadosVideoaula(req.body);
        if (dados.erro) {
            return res.status(400).json({ message: dados.erro });
        }

        const [aulaExiste] = await conexao.query(
            "SELECT id_aula FROM aulas WHERE id_aula = ?",
            [dados.id_aula]
        );
        if (aulaExiste.length === 0) {
            return res.status(400).json({ message: "ID da aula não existe." });
        }

        const [result] = await conexao.query(
            `UPDATE materias
             SET nome_aulas = ?,
                 descricao = ?,
                 link = ?,
                 id_aula = ?
             WHERE id_materias = ?`,
            [dados.nome, dados.desc, dados.url, dados.id_aula, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Videoaula não encontrada." });
        }

        return res.json({ message: "Videoaula atualizada com sucesso." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

app.delete("/videoaulas/:id", verificarToken, exigirAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await conexao.query("DELETE FROM materias WHERE id_materias=?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Matéria não encontrada" });
        }
        res.json({ message: "Excluído com sucesso" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

/* CHATBOT */
app.use("/chatback", chatbotRoutes);

/* FRONT-END ESTÁTICO */
const frontDir = path.join(__dirname, "../front");
if (fs.existsSync(frontDir)) {
    app.use("/front", express.static(frontDir));
    app.use(express.static(frontDir));
}

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

module.exports = app;
