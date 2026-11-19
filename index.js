const express = require("express")
const app = express()
app.use(express.json())
const port = 3000
const db = require("./db")

app.get("/aula", async (req, res) => {
    try {
        const resultado = await db.pool.query("SELECT * FROM aula")
        res.status(200).json(resultado[0])
    } catch (erro) {
        res.status(500).json({erro: erro.message})
    }
})


app.post("/aula", async (req, res) => {
    try {
        const dados = req.body
        const resultado = await db.pool.query(
            "INSERT INTO aula (serie, turma, componente, professor) VALUES (?, ?, ?, ?)",
            [dados.serie, dados.turma, dados.componente, dados.professor]
        )
        res.status(201).json(
            {resultado: "Aula cadastrada, ID = " + resultado[0].insertId}
        )
    } catch (erro) {
        res.status(500).json({erro: erro.message})
    }
})


app.delete("/aula/:id", async (req, res) => {
    try {
        const id = req.params.id
        const resultado = await db.pool.query(
            "DELETE FROM aula WHERE id = ?",
            [id]
        )
        if (resultado[0].affectedRows === 0) {
            return res.status(404).json(
                {erro: "Aula com ID " + id + " não encontrada"}
            )
        }
        res.status(200).json({resultado: "Aula " + id + " excluída com sucesso"})
    } catch (erro) {
        if (erro.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                erro: "Não é possível excluir a aula " + req.params.id +
                      " porque ela possui horários cadastrados. " +
                      "Exclua os horários dela primeiro."
            })
        }
        res.status(500).json({erro: erro.message})
    }
})


app.post("/horario", async (req, res) => {
    try {
        const dados = req.body

        if (!dados.idaula || !dados.dia_semana || !dados.ordem) {
            return res.status(400).json({
                erro: "Informe idaula, dia_semana e ordem"
            })
        }

        const resultado = await db.pool.query(
            "INSERT INTO horario_aula (idaula, dia_semana, ordem) VALUES (?, ?, ?)",
            [dados.idaula, dados.dia_semana, dados.ordem]
        )
        res.status(201).json(
            {resultado: "Horário cadastrado, ID = " + resultado[0].insertId}
        )
    } catch (erro) {
        if (erro.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(404).json({
                erro: "A aula com ID " + req.body.idaula +
                      " não existe. Cadastre a aula antes de criar o horário."
            })
        }
        res.status(500).json({erro: erro.message})
    }
})


app.get("/horario/:dia", async (req, res) => {
    try {
        const dia = req.params.dia
        const resultado = await db.pool.query(
            "SELECT * FROM horario_aula WHERE dia_semana = ? ORDER BY ordem",
            [dia]
        )
        if (resultado[0].length === 0) {
            return res.status(404).json(
                {erro: "Nenhum horário encontrado para o dia '" + dia + "'"}
            )
        }
        res.status(200).json(resultado[0])
    } catch (erro) {
        res.status(500).json({erro: erro.message})
    }
})


app.delete("/horario/:id", async (req, res) => {
    try {
        const id = req.params.id
        const resultado = await db.pool.query(
            "DELETE FROM horario_aula WHERE id = ?",
            [id]
        )
        if (resultado[0].affectedRows === 0) {
            return res.status(404).json(
                {erro: "Horário com ID " + id + " não encontrado"}
            )
        }
        res.status(200).json({resultado: "Horário " + id + " excluído com sucesso"})
    } catch (erro) {
        res.status(500).json({erro: erro.message})
    }
})


app.listen(port, ()=>{
    console.log("API rodando na porta " + port)
})
