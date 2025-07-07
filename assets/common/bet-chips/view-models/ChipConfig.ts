export default class ChipConfig {
    public static getInstance(): ChipConfig {
        if (!this.instance) {
            this.instance = new ChipConfig();
        }

        return this.instance;
    }

    private static instance: ChipConfig;

    chipColor = {
        0: "#9ec6d3",
        1: "#848484",
        5: "#2cb400",
        10: "#ff930d",
        20: "#962bfa",
        50: "#ff48e4",
        100: "#1477ff",
        200: "#10e3ff",
        500: "#ff3818",
        1000: "#193c66",
        2000: "#8c6f01",
        3000: "#222222",
        5000: "#be000b",
        10000: "#7b004b",
        20000: "#007866"
    };

    setData(data: any[]) {
        data.forEach((item) => {
            this.chipColor[item.value] = item.color;
        });
    }

    getChipColor(value: number): cc.Color {
        const hexStr = this.chipColor[value];
        if (!hexStr) {
            console.error(`Missing color for chip ${value}`);
            return cc.Color.BLACK.fromHEX(this.chipColor[0]);
        }
        return cc.Color.BLACK.fromHEX(hexStr);
    }
}
