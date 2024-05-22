import type { ChartTypeRegistry } from 'chart.js/dist/types/index';

declare module 'chart.js' {
    interface PluginOptionsByType<TType extends keyof ChartTypeRegistry> {
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
                width: number;
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

            const textMeasures = ctx.measureText(options.text);
            const actualWidth = textMeasures.width;
            const availableWidth = chartArea.width;

            const x = (chartArea.left + chartArea.right) / 2;
            let y = (chartArea.top + chartArea.bottom) / 2;

            if (actualWidth < availableWidth) {
                ctx.fillText(options.text, x, y);
            } else {
                // We hope two lines will be enough to fit the whole text.
                // We split it on a breakable whitespace, all other whitespaces
                // are expected to be non-breakable.
                const lines = options.text.split(' ');

                // There is no real height measurement but the bottom baseline
                // should be good enough.
                const bottom = textMeasures.fontBoundingBoxDescent;

                // Decrease "y" a bit so that each line is above and below
                // the middle.
                y -= bottom;

                for (const line of lines) {
                    ctx.fillText(line, x, y);
                    y += bottom * 2;
                }
            }

            ctx.restore();
        }
    },
};

export default chartsPlaceholderPlugin;
