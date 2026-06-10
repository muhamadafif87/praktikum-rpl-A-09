# Dokumentasi Pesanan

## Create Pesanan
**Endpoint**
```post
'v1/landing-page/pesanan/'
```

### Laundry
**Request**
```json
{
  "idMitra": "1",
  "typeLayanan": "laundry",
  "items": [
    { "idLayanan": "1", "qty": 2 }
  ],
  "jarakOngkir": 3,
  "jadwal_layanan": [
    { "jam": "09:00", "tanggal": null }
  ],
  "biayaTambahan": {
    "durasi_pengerjaan": { "biaya": 15000, "type": "express" }
  },
  "estimasi": {
    "subtotal": 300000,
    "biaya_ongkir": 20000,
    "total_pembayaran": 320000,
    "beli_baru": 0
  },
  "catatanPengiriman": "testing"
}

```
**Response**
```json
p
```
----- 


## Cancel Pesanan
**Endpoint**
```
p
```
**Request**
```json
p
```
**Response**
```json
p
```
----- 

## Show Detail Pesanan (USER)
**Endpoint**
```
p
```
**Request**
```json
p
```
**Response**
```json
p
```
----- 

## Show Riwayat Pesanan (USER)
**Endpoint**
```
p
```
**Request**
```json
p
```
**Response**
```json
p
```
----- 
