#2-27-2018 CN - Derived and using flashed firmware from nudt build

core_addr = "169.254.199.16"

device_db = {
    "core": {
        "type": "local",
        "module": "artiq.coredevice.core",
        "class": "Core",
        "arguments": {"host": core_addr, "ref_period": 1e-9}
    },
    "core_log": {
        "type": "controller",
        "host": "::1",
        "port": 1068,
        "command": "aqctl_corelog -p {port} --bind {bind} " + core_addr
    },
    "core_cache": {
        "type": "local",
        "module": "artiq.coredevice.cache",
        "class": "CoreCache"
    },
    "core_dma": {
        "type": "local",
        "module": "artiq.coredevice.dma",
        "class": "CoreDMA"
    },

    "i2c_switch0": {
        "type": "local",
        "module": "artiq.coredevice.i2c",
        "class": "PCA9548",
        "arguments": {"address": 0xe0}
    },
    "i2c_switch1": {
        "type": "local",
        "module": "artiq.coredevice.i2c",
        "class": "PCA9548",
        "arguments": {"address": 0xe2}
    },
}


dio_remap = { 6:4, 7:5, 4:6, 5:7 }#  Last 4 channels on BNC DIO are out of order

# DIO (EEM5) starting at RTIO channel 0
# DIO (EEM6) starting at RTIO channel 8
for i in range(8):
    device_db["ttlA" + str(i)] = {
        "type": "local",
        "module": "artiq.coredevice.ttl",
        "class": "TTLInOut",
        "arguments": {"channel": i}
    }
# for i in range(8):
#     device_db["ttlB" + str(i)] = {
#         "type": "local",
#         "module": "artiq.coredevice.ttl",
#         "class": "TTLInOut",
#         "arguments": {"channel": dio_remap.get(i,i)},
#     }

# Urukul (EEM1) starting at RTIO channel 16
device_db.update(
    spi_urukulA={
        "type": "local",
        "module": "artiq.coredevice.spi2",
        "class": "SPIMaster",
        "arguments": {"channel": 16}
    },
    ttl_urukulA_io_update={
        "type": "local",
        "module": "artiq.coredevice.ttl",
        "class": "TTLOut",
        "arguments": {"channel": 17}
    },
    ttl_urukulA_sw0={
        "type": "local",
        "module": "artiq.coredevice.ttl",
        "class": "TTLOut",
        "arguments": {"channel": 18}
    },
    ttl_urukulA_sw1={
        "type": "local",
        "module": "artiq.coredevice.ttl",
        "class": "TTLOut",
        "arguments": {"channel": 19}
    },
    ttl_urukulA_sw2={
        "type": "local",
        "module": "artiq.coredevice.ttl",
        "class": "TTLOut",
        "arguments": {"channel": 20}
    },
    ttl_urukulA_sw3={
        "type": "local",
        "module": "artiq.coredevice.ttl",
        "class": "TTLOut",
        "arguments": {"channel": 21}
    },
    urukulA_cpld={
        "type": "local",
        "module": "artiq.coredevice.urukul",
        "class": "CPLD",
        "arguments": {
            "spi_device": "spi_urukulA",
            "io_update_device": "ttl_urukulA_io_update",
            "refclk": 100e6,
            "clk_sel": 1
        }
    }
)

for i in range(4):
    device_db["urukulA_ch" + str(i)] = {
        "type": "local",
        "module": "artiq.coredevice.ad9912",
        "class": "AD9912",
        "arguments": {
            "pll_n": 10,
            "chip_select": 4 + i,
            "cpld_device": "urukulA_cpld",
            "sw_device": "ttl_urukulA_sw" + str(i)
        }
    }


# Sampler (EEM3) starting at RTIO channel 22
device_db["spi_samplerA_adc"] = {
    "type": "local",
    "module": "artiq.coredevice.spi2",
    "class": "SPIMaster",
    "arguments": {"channel": 22}
}
device_db["spi_samplerA_pgia"] = {
    "type": "local",
    "module": "artiq.coredevice.spi2",
    "class": "SPIMaster",
    "arguments": {"channel": 23}
}
device_db["spi_samplerA_cnv"] = {
    "type": "local",
    "module": "artiq.coredevice.ttl",
    "class": "TTLOut",
    "arguments": {"channel": 24},
}
device_db["samplerA"] = {
    "type": "local",
    "module": "artiq.coredevice.sampler",
    "class": "Sampler",
    "arguments": {
        "spi_adc_device": "spi_samplerA_adc",
        "spi_pgia_device": "spi_samplerA_pgia",
        "cnv_device": "spi_samplerA_cnv"
    }
}


# Zotino (EEM4) starting at RTIO channel 25
device_db["spi_zotinoA"] = {
    "type": "local",
    "module": "artiq.coredevice.spi2",
    "class": "SPIMaster",
    "arguments": {"channel": 25}
}
device_db["ttl_zotinoA_ldac"] = {
    "type": "local",
    "module": "artiq.coredevice.ttl",
    "class": "TTLOut",
    "arguments": {"channel": 26}
}
device_db["ttl_zotinoA_clr"] = {
    "type": "local",
    "module": "artiq.coredevice.ttl",
    "class": "TTLOut",
    "arguments": {"channel": 27}
}
device_db["zotinoA"] = {
    "type": "local",
    "module": "artiq.coredevice.zotino",
    "class": "Zotino",
    "arguments": {
        "spi_device": "spi_zotinoA",
        "ldac_device": "ttl_zotinoA_ldac",
        "clr_device": "ttl_zotinoA_clr"
    }
}

device_db.update(
    led0={
        "type": "local",
        "module": "artiq.coredevice.ttl",
        "class": "TTLOut",
        "arguments": {"channel": 28}
    },
    led1={
        "type": "local",
        "module": "artiq.coredevice.ttl",
        "class": "TTLOut",
        "arguments": {"channel": 29}
    },
)
