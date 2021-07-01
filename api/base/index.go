package base64

import (
	"encoding/base32"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
)

type Result struct {
	Ok   bool   `json:"ok"`
	Data string `json:"data"`
}

func Handler(w http.ResponseWriter, req *http.Request) {
	query := req.URL.Query()
	queryEncode := query.Get("encode")
	queryDecode := query.Get("decode")
	query32 := query.Get("b32") != ""
	var result string
	var err error
	ok := false

	if queryEncode != "" {
		if query32 {
			result = base32.StdEncoding.EncodeToString([]byte(queryEncode))

		} else {
			result = base64.StdEncoding.EncodeToString([]byte(queryEncode))
		}
	} else if queryDecode != "" {
		var bytesArray []byte
		if query32 {
			bytesArray, err = base32.StdEncoding.DecodeString(queryDecode)

		} else {
			bytesArray, err = base64.StdEncoding.DecodeString(queryDecode)
		}
		result = string(bytesArray[:])
	} else {
		w.WriteHeader(404)
		err = errors.New("method not support")
	}
	if err != nil {
		result = err.Error()
	} else {
		ok = true
	}
	w.Header().Add("Cache-Control", "s-maxage=60")
	json.NewEncoder(w).Encode(Result{
		Ok:   ok,
		Data: result,
	})
}
