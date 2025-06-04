# PDF Service

The PDF Service is used for PDF and image manipulation. This API is only accessible via the root server. The client application can't call this API directly without CORS issues. This is by design, because there is no authentication layer here. Instead, we port requests to the PDF service through the root server.

```txt
Client <-> Root Server <-> PDF Service
```

This is a massive pain in the ass but so adding an authentication layer to the PDF Service. It would be better to rewrite the PDF Service in Go and ditch this extra micro service entirely, but I don't have time for that.
