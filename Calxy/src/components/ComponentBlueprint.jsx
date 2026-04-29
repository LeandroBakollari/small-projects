function ComponentBlueprint({ title = "Component", children = null }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default ComponentBlueprint;
