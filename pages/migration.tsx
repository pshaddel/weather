import Image from "next/image";
export default function Migration() {
    return (
        <div className="bg" style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center", backgroundColor: "rgba(241,246,246,255)" }}>
            <video src={"/walk.mp4"} autoPlay loop style={{ width: "100%", height: "auto" }}></video>
            <ProgressbarContainer>
                <ProgressBar progressInPercentage="5" progressLabel="Migrating 45K Digital Posters to V3" />
                <ProgressBar progressInPercentage="92" progressLabel="Contents Cleaned Up 160K" />
                <ProgressBar progressInPercentage="95" progressLabel="Walls Cleaned Up 3000" />
            </ProgressbarContainer>
        </div>
    );
}

function ProgressBar({ progressInPercentage, progressLabel }: { progressInPercentage: string, progressLabel: string }) {
    return <>
        <div style={{ fontSize: "26px", marginBottom: "10px" }}>{progressLabel}</div>
        <div style={{ width: "100%", backgroundColor: "#e0e0df", borderRadius: "5px", overflow: "hidden" }}>
            <div style={{
                width: progressInPercentage + "%",
                height: "20px",
                backgroundColor: "#76c7c0",
                borderRadius: "5px",
                transition: "width 1s ease-in-out"
            }}></div>
        </div>
    </>
}

function ProgressbarContainer({ children }: { children?: React.ReactNode }) {
    return <div style={{ position: "absolute", bottom: "20px", width: "80%", textAlign: "center" }}>
        {children}
    </div>
}