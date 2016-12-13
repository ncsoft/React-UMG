# [React-UMG](https://github.com/ncsoft/React-UMG) &middot; [![npm version](https://img.shields.io/npm/v/react-umg.svg?style=flat)](https://www.npmjs.com/package/react-umg)

This repository is a fork of [react-umg](https://github.com/drywolf/react-umg) whose original author is [Wolfgang Steiner](https://github.com/drywolf)

A React renderer for Unreal Motion Graphics (https://docs.unrealengine.com/latest/INT/Engine/UMG/)

This project is dependent on [Unreal.js](https://github.com/ncsoft/Unreal.js)

### Web-dev like Component Naming

- div(UVerticalBox)
- span(UHorizontalBox)
- text(UTextBlock)
- img(UImage)
- input(EditableText)

### Example

#### Create Component

```js
class MyComponent extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {text:"MyComponent"};
    }

    OnTextChanged(value) {
        this.setState({text: value});
    }

    render() {
        return (
            <div>
                <uEditableTextBox Text={this.state.text} OnTextChanged={value=> this.OnTextChanged(value)}/>
                <text Text={this.state.text}/>
            </div>
        )
    }
}
```

### Draw With React-UMG

```js
let widget = ReactUMG.wrap(<MyComponent/>);
widget.AddToViewport();
return () => {
    widget.RemoveFromViewport();
}
```

### License
- Licensed under the MIT license
- see [LICENSE](https://github.com/ncsoft/React-UMG/blob/master/LICENSE) for details
