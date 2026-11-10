const express = require("express");
const app = express();

const cors = require("cors");
const path = require("path");
const conexao = require("./db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "segredo_super_secreto";

app.use(express.json());
app.use(cors());

// garante que a pasta de upload existe antes de qualquer coisa usar ela
const fs = require("fs"); 
const multer = require("multer");
fs.mkdirSync(path.join(__dirname, "uploads/fotos"), { recursive: true });
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads/fotos")),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `user_${req.usuario.id}${ext}`);
    }
});

// chatbot
const chatbotRoutes = require(
    "./chatback/routes/chatbot"
);

/*MIDDLEWARE TOKEN*/
function verificarToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ erro: "Token não fornecido" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET);
        req.usuario = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ erro: "Token inválido" });
    }
}

/*CONTATO*/
app.post("/contato", async (req, res) => {
    try {
        const { nome = "", email = "", comentario = "" } = req.body;
        if (comentario.length < 10) {
            return res.json({ resposta: "Preencha o comentário corretamente" });
        }
        if (email.length < 6) {
            return res.json({ resposta: "Preencha o email corretamente" });
        }
        if (nome.length < 6) {
            return res.json({ resposta: "Preencha o nome completo" });
        }
        const sql = `INSERT INTO contato (nome, email, comentario) VALUES (?,?,?)`;
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

/*CADASTRO*/
app.post("/cadastro", async (req, res) => {
    try {
        const {
            nome = "",
            email = "",
            senha = "",
            telefone = "",
            
        } = req.body;
        const senhaTrim = senha.trim().replace("ㅤ", "");
        if (senhaTrim === "") {
            return res.json({ resposta: "Preencha uma senha" });
        }
        const senhaRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;

        if (!senhaRegex.test(senhaTrim)) {
            return res.json({
                resposta: "A senha deve possuir no mínimo 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial."
            });
        }
        if (email.length < 6) {
            return res.json({ resposta: "Preencha o email corretamente" });
        }
        if (nome.length <6 ){
            return res.json ({ resposta: "Preencha corretamente o seu nome completo"})
        }
        if (telefone.length < 6) {
            return res.json({ resposta: "Preencha o nome completo" });
        }
        const telefoneRegex = /^\d{10,11}$/;

        if (!telefoneRegex.test(telefone)) {
            return res.json({
                resposta: "Digite um telefone válido contendo apenas números."
            });
        }
        // verificar email existente
        const sqlSelect = `SELECT * FROM cadastro WHERE email = ?`;
        const [rows] = await conexao.query(sqlSelect, [email]);
        if (rows.length !== 0) {
            return res.json({ resposta: "Email já cadastrado" });
        }
        const hash = await bcrypt.hash(senhaTrim, 10);
        const sqlInsert = `
            INSERT INTO cadastro (nome, email, senha, telefone)
            VALUES (?,?,?,?)
        `;
        const [resul] = await conexao.query(sqlInsert, [nome, email, hash, telefone]);
        if (resul.affectedRows === 1) {
            return res.json({ resposta: "Cadastro feito com sucesso!" });
        }
        return res.json({ resposta: "Erro ao cadastrar usuário" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});
/*LOGIN*/
app.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;
        const emailTrim = email?.trim();
        const senhaTrim = senha?.trim();
        if (!emailTrim || !senhaTrim) {
            return res.json({
                resposta: "Preencha email e senha."
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailTrim)) {
            return res.json({
                resposta: "Digite um email válido."
            });
        }
        const sql = `SELECT * FROM cadastro WHERE email=?`;
        const [resultado] = await conexao.query(sql, [emailTrim]);
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
            { expiresIn: "1h" }
        );
        return res.json({
            mensagem: "Acesso liberado",
            token: token,
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
        const sql = `SELECT nome, email, telefone, bio, foto FROM cadastro WHERE id_cadastro=?`;
        const [rows] = await conexao.query(sql, [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ resposta: "Usuário não encontrado" });
        }
        return res.json(rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});
const upload = multer({ storage });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));// pra servir as imagens

app.post("/usuario/foto", verificarToken, upload.single("foto"), async (req, res) => {
    try {
        const userId = req.usuario.id;
        const caminho = `/uploads/fotos/${req.file.filename}`;
        const sql = `UPDATE cadastro SET foto=? WHERE id_cadastro=?`;
        await conexao.query(sql, [caminho, userId]);
        return res.json({ resposta: "Foto atualizada com sucesso", foto: caminho });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro ao salvar foto" });
    }
});

/* REMOVER FOTO */
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
/*CADASTRO DE AULAS*/
app.post("/CadastroAulas", verificarToken, async (req, res) => {
    try {
        // AQUI SIM!
        if (req.usuario.nivel !== "A") {
            
            return res.status(403).json({ resposta: "Acesso negado" });
        }
        const { materia, duracao, qtd_aulas } = req.body;
        const sql = `
            INSERT INTO aulas (materia, duracao, qtd_aulas)
            VALUES (?,?,?)
        `;
        const [result] = await conexao.query(sql, [materia, duracao, qtd_aulas]);
        if (result.affectedRows === 1) {
            return res.json({ resposta: "Aulas cadastradas com sucesso" });
        }
        return res.json({ resposta: "Erro ao cadastrar aulas" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});
/*TROCAR SENHA*/
app.put("/trocarSenha", verificarToken, async (req, res) => {
    try {
        const { novaSenha } = req.body;
        const userId = req.usuario.id;
        if (!novaSenha || novaSenha.trim().length < 6) {
            return res.json({ resposta: "Nova senha muito curta" });
        }
        const novaSenhaHash = await bcrypt.hash(novaSenha.trim(), 10);
        const sql = `UPDATE cadastro SET senha=? WHERE id_cadastro=?`;
        const [update] = await conexao.query(sql, [novaSenhaHash, userId]);
        if (update.affectedRows === 1) {
            return res.json({ resposta: "Senha alterada com sucesso" });
        }
        return res.json({ resposta: "Erro ao atualizar senha" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});
/*VERIFICAR EMAIL*/
app.post("/verificarEmail", async (req, res) => {
    try {
        const { email } = req.body;
        const sql = `SELECT * FROM cadastro WHERE email=?`;
        const [resultado] = await conexao.query(sql, [email]);
        return res.json({ existe: resultado.length > 0 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});
/*RECUPERAR SENHA*/
app.put("/recuperarSenha", async (req, res) => {
    try {
        const { email, novaSenha } = req.body;
        if (!novaSenha || novaSenha.trim().length < 6) {
            return res.json({ resposta: "Senha inválida" });
        }
        const sql = `SELECT * FROM cadastro WHERE email=?`;
        const [user] = await conexao.query(sql, [email]);
        if (user.length === 0) {
            return res.json({ resposta: "Email não encontrado" });
        }
        const hash = await bcrypt.hash(novaSenha.trim(), 10);
        const update = `
            UPDATE cadastro
            SET senha=?
            WHERE email=?
        `;
        await conexao.query(update, [hash, email]);
        return res.json({ resposta: "Senha redefinida com sucesso" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});
/*ATUALIZAR USUÁRIO*/
app.put("/usuario", verificarToken, async (req, res) => {
    try {
        const { nome = "", email = "", telefone = "", bio = "" } = req.body;
        const userId = req.usuario.id;

        if (nome.trim().length < 6) return res.json({ resposta: "Preencha o nome completo" });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.json({ resposta: "Digite um email válido" });
        if (!/^\d{10,11}$/.test(telefone)) return res.json({ resposta: "Digite um telefone válido" });

        const [dup] = await conexao.query(
            "SELECT id_cadastro FROM cadastro WHERE email=? AND id_cadastro<>?",
            [email.trim(), userId]
        );
        if (dup.length) return res.json({ resposta: "Email já cadastrado" });

        const [result] = await conexao.query(
            "UPDATE cadastro SET nome=?, email=?, telefone=?, bio=? WHERE id_cadastro=?",
            [nome.trim(), email.trim(), telefone, bio.trim(), userId]
        );
        return res.json({
            resposta: result.affectedRows === 1 ? "Usuário atualizado com sucesso" : "Erro ao atualizar usuário"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ erro: "Erro no servidor" });
    }
});

/*listar aulas*/
app.get("/aulas", async (req, res) => {
    const [dados] = await conexao.query("SELECT * FROM aulas");
    res.json(dados);
});
/*LISTAR FEEDBACKS*/
app.get("/feedbacks", verificarToken, async (req, res) => {
    try {
        if (req.usuario.nivel !== "A") {
            return res.status(403).json({
                resposta: "Acesso negado"
            });
        }
        const sql = `
            SELECT id_contato, nome, email, comentario
            FROM contato
            ORDER BY id_contato DESC
        `;
        const [dados] = await conexao.query(sql);
        res.json(dados);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            erro: "Erro ao buscar feedbacks"
        });
    }
});
/*EDITAR FEEDBACK*/
app.put("/feedbacks/:id", verificarToken, async (req, res) => {
    try {
        if (req.usuario.nivel !== "A") {
            return res.status(403).json({
                resposta: "Acesso negado"
            });
        }
        const id = req.params.id;
        const { nome, email, comentario } = req.body;

        const sql = `
            UPDATE contato
            SET nome=?, email=?, comentario=?
            WHERE id_contato=?
        `;
        const [resultado] = await conexao.query(sql, [
            nome,
            email,
            comentario,
            id
        ]);
        if (resultado.affectedRows === 1) {
            return res.json({
                resposta: "Feedback atualizado com sucesso"
            });
        }
        res.json({
            resposta: "Feedback não encontrado"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            erro: "Erro ao atualizar feedback"
        });
    }
});
/*EXCLUIR FEEDBACK*/
app.delete("/feedbacks/:id", verificarToken, async (req, res) => {
    try {
        if (req.usuario.nivel !== "A") {
            return res.status(403).json({
                resposta: "Acesso negado"
            });
        }
        const id = req.params.id;
        const sql = `
            DELETE FROM contato
            WHERE id_contato=?
        `;
        const [resultado] = await conexao.query(sql, [id]);
        if (resultado.affectedRows === 1) {
            return res.json({
                resposta: "Feedback removido com sucesso"
            });
        }
        res.json({
            resposta: "Feedback não encontrado"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            erro: "Erro ao excluir feedback"
        });
    }
});
// LISTAR (com nome da matéria)
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
        res.status(500).json({
            error: error.message
        });
    }
});
// CADASTRAR VIDEOAULA
app.post("/videoaulas", verificarToken, async (req, res) => {
    try {

        const {
            nome_aulas,
            descricao,
            link,
            id_aula
        } = req.body;

        const nome = nome_aulas?.trim();
        const desc = descricao?.trim();
        const url = link?.trim();

        // Verifica campos vazios
        if (!nome || !desc || !url || !id_aula) {
            return res.status(400).json({
                message: "Preencha todos os campos."
            });
        }

        // Nome
        if (nome.length < 5) {
            return res.status(400).json({
                message: "O nome da aula deve possuir pelo menos 5 caracteres."
            });
        }

        // Descrição
        if (desc.length < 15) {
            return res.status(400).json({
                message: "A descrição deve possuir pelo menos 15 caracteres."
            });
        }

        // Link do YouTube
        const youtubeRegex =
        /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})(\?.*)?$/;

        if (
            !url.includes("youtube.com/watch?v=") &&
            !url.includes("youtu.be/")
        ) {
            return res.status(400).json({
                message: "Informe um link válido do YouTube."
            });
        }

        // Verifica se a matéria existe
        const [aulaExiste] = await conexao.query(
            "SELECT * FROM aulas WHERE id_aula = ?",
            [id_aula]
        );

        if (aulaExiste.length === 0) {
            return res.status(400).json({
                message: "ID da aula não existe."
            });
        }

        // Insere no banco
        const [result] = await conexao.query(
            `INSERT INTO materias
            (nome_aulas, descricao, link, id_aula)
            VALUES (?, ?, ?, ?)`,
            [nome, desc, url, id_aula]
        );

        return res.status(201).json({
            message: "Videoaula cadastrada com sucesso.",
            id: result.insertId
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error.message
        });
    }
});
// EDITAR VIDEOAULA
app.put("/videoaulas/:id", verificarToken, async (req, res) => {
    try {

        const { id } = req.params;

        const {
            nome_aulas,
            descricao,
            link,
            id_aula
        } = req.body;

        const nome = nome_aulas?.trim();
        const desc = descricao?.trim();
        const url = link?.trim();

        if (!nome || !desc || !url || !id_aula) {
            return res.status(400).json({
                message: "Preencha todos os campos."
            });
        }

        if (nome.length < 5) {
            return res.status(400).json({
                message: "O nome da aula deve possuir pelo menos 5 caracteres."
            });
        }

        if (desc.length < 15) {
            return res.status(400).json({
                message: "A descrição deve possuir pelo menos 15 caracteres."
            });
        }
        const youtubeRegex =
            /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]{11}([?&].*)?$/;
        
            if (!youtubeRegex.test(url)) {
            return res.status(400).json({
                message: "Informe um link válido do YouTube."
            });
        }

        const [aulaExiste] = await conexao.query(
            "SELECT * FROM aulas WHERE id_aula = ?",
            [id_aula]
        );

        if (aulaExiste.length === 0) {
            return res.status(400).json({
                message: "ID da aula não existe."
            });
        }

        const [result] = await conexao.query(
            `UPDATE materias
             SET nome_aulas = ?,
                 descricao = ?,
                 link = ?,
                 id_aula = ?
             WHERE id_materias = ?`,
            [nome, desc, url, id_aula, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Videoaula não encontrada."
            });
        }

        return res.json({
            message: "Videoaula atualizada com sucesso."
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: error.message
        });
    }
});
// EXCLUIR
app.delete("/videoaulas/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await conexao.query(
            'DELETE FROM materias WHERE id_materias=?',
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Matéria não encontrada"
            });
        }
        res.json({
            message: "Excluído com sucesso"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error.message
        });
    }
});
const PORT = process.env.PORT || 3000;
app.use(
    "/chatback",
    chatbotRoutes
);
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});