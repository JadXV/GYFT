"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"; // or any highlight.js theme CSS

const markdownContent = `
Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum id,
ipsa illo nisi tempora laborum minus voluptates dolor error tempore

\`\`\`py
print("Hello, World!")
\`\`\`

# raf

repellendus, molestiae quasi nobis voluptate perferendis provident
ex, commodi aperiam? Corrupti ab aliquam, harum reprehenderit
molestias nihil nemo veritatis ullam cumque facere sint nesciunt
libero ipsum ipsa iste provident facilis ex rem quidem unde eum.
Adipisci ut praesentium accusamus magnam. Et assumenda minus totam
nesciunt dolor eveniet facere dolore ut dolores dignissimos
accusamus ipsam consequatur ducimus perferendis nemo sunt maiores
quaerat ex, alias nam ullam autem. Id asperiores modi facere.
Perspiciatis aliquam, totam sit consequatur officia, odit corporis
modi molestias reprehenderit non quo aperiam aliquid placeat commodi
quos earum beatae sequi nostrum, iusto perferendis repudiandae.
Aliquid atque expedita libero corporis! Dolore officiis hic ipsa
atque temporibus inventore! Veniam earum, cupiditate distinctio
quidem ipsum, maxime error incidunt praesentium, itaque nam
inventore voluptatum reprehenderit officiis obcaecati assumenda
aperiam reiciendis quod! Rem, iste. Eligendi ex dolor nostrum, rem
numquam ad, impedit alias quas voluptates maxime aspernatur unde
harum sed dolore voluptate deleniti sunt exercitationem sit
consequatur! In perspiciatis voluptas aspernatur cupiditate iusto.
Quam! Aspernatur odio nesciunt quia, laudantium velit recusandae
commodi excepturi natus delectus mollitia saepe fugit! Ipsum sit
laudantium perferendis vel, laborum maxime fuga, cumque, quia eius
quibusdam earum porro est repudiandae? Adipisci doloribus maxime
molestias, excepturi repellendus aut accusamus iste quo labore culpa
quod dicta nemo saepe facilis! Laboriosam maxime eum cupiditate quam
doloribus, sit facilis, nobis eos non quas mollitia. Inventore velit
maxime eligendi nostrum qui? Repellendus praesentium magnam ipsa.
Voluptatibus ab officia, repudiandae quo, molestiae eius tenetur
tempore unde corrupti reiciendis fuga. Deleniti ipsam rem iusto
reiciendis nostrum odio! Sapiente quae velit quam! Sint consequuntur
dolores illum ut rerum voluptas dolore architecto, molestias
corporis earum culpa obcaecati neque ratione doloremque ea magnam ex
consequatur error! Aspernatur tempora delectus explicabo. Pariatur
ullam vitae quos et minima non veritatis placeat corporis hic in
nisi tenetur veniam aspernatur accusantium, quae natus tempora vero
incidunt blanditiis deleniti quaerat totam nemo? Veniam, nihil iure.
Asperiores at aliquid architecto repellat? Quod aliquid nostrum
quasi ex temporibus? Veritatis nesciunt deleniti libero dolore
corrupti quidem sequi, hic sint ipsum, fugit dolorum sunt quod, id
culpa cupiditate itaque. Aliquid, cumque. Totam adipisci asperiores
nemo cum quidem numquam ullam, aspernatur incidunt vitae doloribus
quas fugit, minima tempore veritatis harum rerum alias reiciendis?
Omnis molestiae eligendi culpa, possimus corrupti voluptatum!
Mollitia amet consectetur ex fugiat ipsam repellat laborum maxime
unde reiciendis eligendi? Et architecto eveniet, sapiente alias
dolorum repudiandae quidem. Maiores fuga expedita minima commodi
nobis praesentium aliquid ipsam temporibus. Dignissimos hic iusto
labore maxime et delectus eum est autem? Unde dolore blanditiis
deserunt voluptatum autem vel, nostrum tempore in. Doloribus dolore
sapiente voluptate iste at consectetur voluptatem architecto minus!
`;

export default function Text() {
  return (
    <div className="min-h-screen bg-black text-[#919191] flex flex-col pt-24 px-6">
      <div className="container mx-auto flex flex-col md:flex-row items-start gap-8">
        <div className="w-48 h-48 flex-shrink-0">
          <img
            src="/js.png"
            alt="JavaScript Logo"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex-1">
          <h1 className="text-white text-5xl font-extrabold mb-4">
            JavaScript
          </h1>

          <div className="prose prose-invert max-w-3xl mb-8 font-mono text-lg">
                      <ReactMarkdown
            rehypePlugins={[rehypeHighlight]}
            // className=""
          >
            {markdownContent}
          </ReactMarkdown>
          </div>


          <a
            href="./quiz"
            className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Continue
          </a>
        </div>
      </div>
    </div>
  );
}
