import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AboutPage() {
    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">About aiKOL DAO</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose dark:prose-invert">
                        <p className="text-lg mb-4">
                            Welcome to aiKOL DAO, a revolutionary platform at the intersection of
                            artificial intelligence and decentralized autonomous organizations.
                        </p>

                        <h2 className="text-2xl font-semibold mt-6 mb-3">Our Mission</h2>
                        <p className="mb-4">
                            We're building the future of AI-powered communities, where artificial
                            intelligence and human creativity come together to create meaningful
                            interactions and valuable experiences.
                        </p>

                        <h2 className="text-2xl font-semibold mt-6 mb-3">What We Do</h2>
                        <p className="mb-4">
                            aiKOL DAO leverages cutting-edge AI technology to facilitate authentic
                            connections between users and AI characters, while maintaining a
                            decentralized governance structure that ensures community-driven
                            development and decision-making.
                        </p>

                        <h2 className="text-2xl font-semibold mt-6 mb-3">Join Us</h2>
                        <p>
                            Whether you're an AI enthusiast, developer, or community builder,
                            there's a place for you in aiKOL DAO. Together, we're shaping the
                            future of AI-human interactions.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}