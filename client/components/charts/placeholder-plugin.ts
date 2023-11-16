declare module 'chart.js' {
    interface PluginOptionsByType<TType extends ChartType> {
        placeholder: {
            text: string;
            backgroundColor: string;
            color: string;
            font: string;
        };
    }
}

// Inspired from https://github.com/chartjs/Chart.js/issues/6036#issuecomment-913710574
const chartsPlaceholderPlugin = {
    id: 'placeholder',

    defaults: {
        text: 'NO DATA',
        backgroundColor: '#DDDDDD',
        color: '#000000',
        font: 'bold 20px sans-serif',
    },

    afterDraw: (
        chart: {
            ctx: CanvasRenderingContext2D;
            chartArea: {
                left: number;
                right: number;
                top: number;
                bottom: number;
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: any;
        },
        _args: never,
        options: { text: string; backgroundColor: string; color: string; font: string }
    ) => {
        if (!chart.data || !chart.data.datasets || chart.data.datasets.length === 0) {
            const { ctx, chartArea } = chart;

            ctx.save();

            // Draw the background
            ctx.fillStyle = options.backgroundColor;
            ctx.fillRect(
                chartArea.left,
                chartArea.top,
                chartArea.right - chartArea.left,
                chartArea.bottom - chartArea.top
            );

            // Draw the placeholder text
            ctx.fillStyle = options.color;
            ctx.font = options.font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                options.text,
                (chartArea.left + chartArea.right) / 2,
                (chartArea.top + chartArea.bottom) / 2
            );

            ctx.restore();
        }
    },
};

export default chartsPlaceholderPlugin;
