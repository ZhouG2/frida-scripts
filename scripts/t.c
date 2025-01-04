void fcn_6e88a56ef8 (int64_t arg_20h, int64_t arg_70h, int64_t arg1, int64_t arg2) {
    int64_t var_0h_2;
    int64_t var_10h_2;
    int64_t var_20h;
    int64_t var_0h_3;
    int64_t var_10h_3;
    int64_t var_20h_2;
    int64_t var_28h;
    int64_t var_30h;
    int64_t var_38h;
    int64_t var_0h_4;
    int64_t var_10h_4;
    int64_t var_20h_3;
    int64_t var_30h_2;
    int64_t var_40h;
    int64_t var_48h;
    int64_t var_0h;
    int64_t var_58h;
    int64_t var_10h;
    int64_t var_68h;
    x0 = arg1;
    x1 = arg2;
    *(sp) = x19;
    *((sp + 8)) = x20;
    *((sp + 0x10)) = x21;
    *((sp + 0x10 + 8)) = x30;
    x2 = *(x1);
    x2 = *((x2 - 0x18));
    while (x0 == 0) {
label_0:
        w0 = 0;
label_2:
        x19 = *(sp);
        x20 = *((sp + 8));
        x21 = *((sp + 0x10));
        x30 = *((sp + 0x10 + 8));
        return;
        x20 = x0;
        x19 = x1;
        w0 = void (*0x6e88a5ca78)(uint64_t, uint64_t, uint64_t) (x0, x1, x2);
        w0 = (int8_t) w0;
        if (w0 != 0) {
            goto label_8;
        }
label_1:
        x21 = *(x19);
        w0 = *(x21);
        if (w0 == 0x2f) {
            goto label_9;
        }
        x1 = *((x20 + 0x70));
        x0 = x19;
        x2 = 0;
        x3 = *((x1 - 0x18));
        x0 = fcn_6e895bc5d8 (x0, x1, x2, x3);
        x1 = x21 + 7;
        x21 = (x0 != 0) ? x21 : x1;
        x0 = *(0x6e89ab9c68);
    }
    x1 = x21;
    w2 = 0;
    x0 = fcn_6e888834a0 ();
    if (x0 == 0) {
        goto label_0;
    }
    fcn_6e88882bc0 ();
    w0 = 1;
    x19 = *(sp);
    x20 = *((sp + 8));
    x21 = *((sp + 0x10));
    x30 = *((sp + 0x10 + 8));
    return;
label_8:
    w0 = void (*0x6e88a5ca84)(uint32_t) (w0);
    w0 = (int8_t) w0;
    if (w0 != 0) {
        goto label_1;
    }
    x0 = x19;
    x21 = *((sp + 0x10));
    x30 = *((sp + 0x10 + 8));
    x19 = *(sp);
    x20 = *((sp + 8));
    goto label_10;
label_9:
    x0 = x21;
    x1 = 0x6e896a9890;
    x0 = fcn_6e88883660 ();
    if (x0 == 0) {
        goto label_0;
    }
    fcn_6e88884320 ();
    w0 = 1;
    goto label_2;
label_10:
    x2 = 0x6907;
    x2 &= 0x0;
    x2 |= 0xc70f0000;
    *(sp) = x19;
    *((sp + 8)) = x20;
    x20 = 0x6e89ac1000;
    *((sp + 0x10)) = x21;
    *((sp + 0x10 + 8)) = x22;
    *((sp + 0x20)) = x23;
    *((sp + 0x20 + 8)) = x24;
    *((sp + 0x30)) = x25;
    *((sp + 0x30 + 8)) = x30;
    x21 = x0;
    x0 = *(x0);
    x22 = 0x6e89ae6000;
    x3 = *(0x6e89ac13a8);
    x1 = *((x0 - 0x18));
    *((sp + 0x68)) = x3;
    x0 = fcn_6e8957205c (x0, x1, x2);
    x5 = x0;
    x4 = x22 + 0x518;
    x3 = x0;
    x4 += 0x28;
    x2 = x21;
    x0 = x4;
    x1 = *((x4 + 8));
    x4 = x5 / x1;
    value_0 = x4 * x1;
    x1 = value_0 - x5;
    x0 = void (*0x6e88a5cf80)(uint64_t, uint64_t) (x0, x1);
    if (x0 == 0) {
        goto label_11;
    }
    x3 = *(x0);
    if (x3 == 0) {
        goto label_11;
    }
    x19 = x3 + 8;
    w0 = *((x19 + 8));
    while (1) {
label_3:
        x20 = *((x20 + 0x3a8));
        x2 = *((sp + 0x68));
        x1 = *(x20);
        if (x2 != x1) {
            goto label_12;
        }
        x19 = *(sp);
        x20 = *((sp + 8));
        x21 = *((sp + 0x10));
        x22 = *((sp + 0x10 + 8));
        x23 = *((sp + 0x20));
        x24 = *((sp + 0x20 + 8));
        x25 = *((sp + 0x30));
        x30 = *((sp + 0x30 + 8));
        return;
        x0 = *(x21);
        x1 = 0x6e896a9890;
        x0 = fcn_6e88883660 ();
        if (x0 != 0) {
            w1 = 1;
            *((x19 + 8)) = w1;
            fcn_6e88884320 ();
        }
        w0 = *((x19 + 8));
    }
label_11:
    x0 = sp + 0x50;
    x1 = 0x6e895ea560;
    x2 = 0x6e895dc468;
    w0 = fcn_6e88a5c4b0 (x0, x1, x2, x3, x4);
    w0 = (int8_t) w0;
    if (w0 != 0) {
        goto label_13;
    }
    w19 = w0;
    do {
        x0 = *(x21);
        x2 = 0x6907;
        x2 &= 0x0;
        x2 |= 0xc70f0000;
        x1 = *((x0 - 0x18));
        x0 = fcn_6e8957205c (x0, x1, x2);
        x23 = x0;
        x1 = x22 + 0x518;
        x3 = x0;
        x1 += 0x28;
        x2 = x21;
        x0 = x1;
        x24 = *((x1 + 8));
        x1 = x23 / x24;
        value_1 = x1 * x24;
        x24 = value_1 - x23;
        x1 = x24;
        x0 = void (*0x6e88a5cf80)(uint64_t, uint64_t) (x0, x1);
        if (x0 == 0) {
            goto label_14;
        }
        x4 = *(x0);
        if (x4 == 0) {
            goto label_14;
        }
        x0 = x4 + 0x10;
label_4:
        *(x0) = w19;
        w0 = w19;
        goto label_3;
label_13:
        x2 = *((sp + 0x50));
        x1 = *(x21);
        x0 = x2;
        x2 = *(x2);
        x2 = *((x2 + 0x538));
        x0 = uint64_t (*x2)(uint64_t, uint64_t, uint64_t) (x0, x1, x2);
        x3 = x0;
        x19 = x0;
        x1 = *((sp + 0x58));
        x2 = *((sp + 0x60));
        x0 = *((sp + 0x50));
        w0 = fcn_6e889bea14 (x0, x1, x2, x3, x4, x5, x6);
        w0 = (int8_t) w0;
        x2 = *((sp + 0x50));
        x1 = x19;
        w19 = (w0 != 0) ? 1 : 0;
        x0 = x2;
        x2 = *(x2);
        x2 = *((x2 + 0xb8));
        uint64_t (*x2)(uint64_t, uint64_t, uint64_t) (x0, x1, x2);
        x2 = *((sp + 0x50));
        x1 = *((sp + 0x58));
        x0 = x2;
        x2 = *(x2);
        x2 = *((x2 + 0xb8));
        uint64_t (*x2)(uint64_t, uint64_t, uint64_t) (x0, x1, x2);
    } while (1);
label_14:
    x0 = 0x20;
    x0 = fcn_6e895721e4 (x0);
    x25 = x0;
    *((sp + 0x48)) = x0;
    x1 = x21;
    *(x25) = 0;
    x25 += 8;
    x0 = x25;
    fcn_6e895be694 (x0, x1, x2);
    *((x25 + 8)) = 0;
    x0 = x22 + 0x518;
    x3 = *((sp + 0x48));
    x0 += 0x28;
    x1 = x24;
    x2 = x23;
    x0 = void (*0x6e88a5cdc0)(uint64_t, uint64_t) (x0, x1);
    x0 += 0x10;
    goto label_4;
label_12:
    fcn_6e888831e0 ();
    *(sp) = x19;
    *((sp + 8)) = x20;
    x20 = 0x6e89ac1000;
    x19 = 0x6e89ae6000;
    x1 = x19 + 0x518;
    *((sp + 0x10)) = x21;
    *((sp + 0x10 + 8)) = x30;
    x21 = x0;
    w1 = *((x1 + 0x18));
    x2 = *(0x6e89ac13a8);
    *((sp + 0x38)) = x2;
    while (1) {
        x19 += 0x518;
        w1 = *((x19 + 0x19));
        if (w1 != 0) {
            w0 = *((x19 + 0x1a));
            if (w0 == 0) {
                goto label_15;
            }
        }
label_5:
        x20 = *((x20 + 0x3a8));
        x1 = *((sp + 0x38));
        x0 = *(x20);
        if (x1 != x0) {
            goto label_16;
        }
        x19 = *(sp);
        x20 = *((sp + 8));
        x21 = *((sp + 0x10));
        x30 = *((sp + 0x10 + 8));
        return;
        fcn_6e88a5c6f8 (x0, x1, x2);
    }
label_15:
    x0 = x21;
    w0 = void (*0x6e88a5d060)(uint64_t, uint64_t, uint64_t, uint64_t) (x0, x1, x2, x3);
    w0 = (int8_t) w0;
    if (w0 == 0) {
        goto label_5;
    }
    x0 = sp + 0x20;
    x1 = 0x6e895ea570;
    x2 = 0x6e895ea528;
    w0 = fcn_6e88a5c4b0 (x0, x1, x2, x3, x4);
    w0 = (int8_t) w0;
    if (w0 == 0) {
        goto label_5;
    }
    x2 = *((sp + 0x20));
    x1 = *(x21);
    x0 = x2;
    x2 = *(x2);
    x2 = *((x2 + 0x538));
    x0 = uint64_t (*x2)(uint64_t, uint64_t, uint64_t) (x0, x1, x2);
    x3 = x0;
    x19 = x0;
    x1 = *((sp + 0x28));
    x0 = *((sp + 0x20));
    x2 = *((sp + 0x30));
    fcn_6e889c98dc (x0, x1, x2, x3, x4, x5, x6);
    x2 = *((sp + 0x20));
    x1 = x19;
    x0 = x2;
    x2 = *(x2);
    x2 = *((x2 + 0xb8));
    uint64_t (*x2)(uint64_t, uint64_t, uint64_t) (x0, x1, x2);
    x2 = *((sp + 0x20));
    x1 = *((sp + 0x28));
    x0 = x2;
    x2 = *(x2);
    x2 = *((x2 + 0xb8));
    uint64_t (*x2)(uint64_t, uint64_t, uint64_t) (x0, x1, x2);
    goto label_5;
label_16:
    fcn_6e888831e0 ();
    x2 = 0x6907;
    x2 &= 0x0;
    x2 |= 0xc70f0000;
    *(sp) = x19;
    *((sp + 8)) = x20;
    *((sp + 0x10)) = x21;
    *((sp + 0x10 + 8)) = x22;
    *((sp + 0x20)) = x23;
    *((sp + 0x20 + 8)) = x30;
    x22 = x0;
    x19 = 0x6e89ae6000;
    x0 = *(x0);
    x23 = x19 + 0x518;
    x1 = *((x0 - 0x18));
    x0 = fcn_6e8957205c (x0, x1, x2);
    x20 = x0;
    x0 = x23 + 0x28;
    x3 = x20;
    x21 = *((x0 + 8));
    x2 = x22;
    x1 = x20 / x21;
    value_2 = x1 * x21;
    x20 = value_2 - x20;
    x1 = x20;
    x0 = void (*0x6e88a5cf80)(uint64_t, uint64_t) (x0, x1);
    if (x0 == 0) {
        goto label_17;
    }
    x2 = x20 << 3;
    x4 = *((x23 + 0x28));
    x3 = *(x0);
    x5 = x4 + x2;
    x1 = *((x4 + x2));
    if (x0 == x1) {
        goto label_18;
    }
    x1 = *(x3);
    if (x1 == 0) {
        goto label_6;
    }
    x5 = *((x1 + 0x18));
    x2 = x5 / x21;
    value_3 = x2 * x21;
    x21 = value_3 - x5;
    if (x20 == x21) {
        goto label_6;
    }
    offset_4 = x21 << 3;
    *((x4 + offset_4)) = x0;
    x1 = *(x3);
    do {
label_6:
        *(x0) = x1;
        x19 += 0x518;
        x0 = x3;
        fcn_6e88a5c3a8 (x0, x1, x2);
        x0 = *((x19 + 0x40));
        x0--;
        *((x19 + 0x40)) = x0;
label_17:
        x19 = *(sp);
        x20 = *((sp + 8));
        x21 = *((sp + 0x10));
        x22 = *((sp + 0x10 + 8));
        x23 = *((sp + 0x20));
        x30 = *((sp + 0x20 + 8));
        return;
label_18:
        x6 = *(x3);
        if (x6 == 0) {
            goto label_19;
        }
        x7 = *((x6 + 0x18));
        x1 = x6;
        x5 = x7 / x21;
        value_5 = x5 * x21;
        x21 = value_5 - x7;
    } while (x20 == x21);
    offset_6 = x21 << 3;
    *((x4 + offset_6)) = x0;
    x1 = *((x23 + 0x28));
    x5 = x1 + x2;
    x2 = *((x1 + x2));
    do {
        x1 = x19 + 0x518;
        x4 = x1 + 0x38;
        x1 += 0x28;
        if (x2 == x4) {
            goto label_20;
        }
label_7:
        *(x5) = 0;
        x1 = *(x3);
        goto label_6;
label_19:
        x2 = x0;
    } while (1);
label_20:
    *((x1 + 0x10)) = x6;
    goto label_7;
}