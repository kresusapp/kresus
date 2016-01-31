export default class ColorPicker extends React.Component {

    getValue() {
        return this.refs.picker.getDOMNode().value;
    }

    componentDidMount() {
        if (!Modernizr.inputtypes.color)
            $(this.refs.picker.getDOMNode()).minicolors().parent().css('width', '100%');
    }

    componentWillUnmount() {
        if (!Modernizr.inputtypes.color)
            $(this.refs.picker.getDOMNode()).minicolors('destroy');
    }

    render() {
        function generateColor() {
            let convertRGBToHex = function(rgb) {
                let hexRed = rgb.r.toString(16).toUpperCase();
                if (hexRed.length < 2)
                    hexRed += hexRed;

                let hexGreen = rgb.g.toString(16).toUpperCase();
                if (hexGreen.length < 2)
                    hexGreen += hexGreen;

                let hexBlue = rgb.b.toString(16).toUpperCase();
                if (hexBlue.length < 2)
                    hexBlue += hexBlue;

                return `#${hexRed}${hexGreen}${hexBlue}`;
            };

            let generatePrimaryColor = function() {
                // Ranges of bright colors
                let ranges = [
                    [100, 255],
                    [50, 200],
                    [10, 100]
                ];

                // Select random range and remove
                let r = ranges.splice(Math.floor(Math.random() * ranges.length), 1)[0];

                // Pick a random number from within the range
                let [low, high] = r;
                return Math.floor(Math.random() * (high - low)) + low;
            };

            return convertRGBToHex({
                r: generatePrimaryColor(),
                g: generatePrimaryColor(),
                b: generatePrimaryColor()
            });
        }

        return (
            <input
              type={ Modernizr.inputtypes.color ? 'color' : 'hidden' }
              className="form-control"
              defaultValue={ this.props.defaultValue || generateColor() }
              ref="picker"
            />);
    }
}
