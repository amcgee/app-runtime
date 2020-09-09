import css from 'styled-jsx/css'

export default css.global`
    .editor {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .controls {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 8px;
        align-items: center;
    }

    .radio-group > div {
        display: grid;
        grid-auto-flow: column;
        grid-gap: 16px;
    }

    .error {
        padding: 8px;
        color: white;
        background-color: darkred;
        width: 100%;
        text-align: center;
    }
`
